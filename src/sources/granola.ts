import type { EntryItem, FeedConfig, Source, SourceItem } from "../types.js";
import { GranolaClient, type GranolaNote } from "../granola.js";
import { customerLabel, isCustomerMeeting, sanitizeName, type FilterRules } from "../filter.js";
import { log } from "../log.js";

// Customer meetings from Granola. Composition follows the target entity's
// authoring guide (v2, read 2026-09-01): name is "Customer — date — purpose";
// body is one header line then Granola's structured summary — never the raw
// transcript. Dedupe key is "Customer — date", which also matches entries
// people wrote by hand before the courier existed.
interface GranolaOptions {
  internalDomains?: string[];
  internalEmails?: string[];
  lookbackHours?: number;
}

export function composeEntry(note: GranolaNote, rules: FilterRules): EntryItem {
  const date = (note.created_at ?? "").slice(0, 10);
  const customer = customerLabel(note, rules);
  const purpose = sanitizeName(note.title ?? "meeting", 60);
  const name = `${customer} — ${date} — ${purpose}`.slice(0, 120).trim();

  const attendees = (note.attendees ?? [])
    .map((a) => (a.name && a.email ? `${a.name} <${a.email}>` : a.email ?? a.name ?? "unknown"))
    .join(", ");
  const header =
    `${note.title ?? "Untitled meeting"} — ${note.created_at ?? "unknown time"} — ` +
    `attendees: ${attendees || "none recorded"} — source: Granola, meeting id: ${note.id}`;
  const summary = note.summary_markdown?.trim() || note.summary_text?.trim() || "";
  const body = summary ? `${header}\n\n${summary}` : `${header}\n\nNo summary was available for this meeting.`;

  return {
    kind: "entry",
    sourceId: note.id,
    name,
    body,
    occurredAt: note.created_at,
    structured: { granola_note_id: note.id, source: "granola-courier" },
    dedupeKey: `${customer} — ${date}`,
  };
}

export const granolaSource: Source = {
  async fetch(feed: FeedConfig, apiKey: string): Promise<SourceItem[]> {
    const opts = (feed.options ?? {}) as GranolaOptions;
    const rules: FilterRules = {
      internalDomains: (opts.internalDomains ?? []).map((d) => d.toLowerCase()),
      internalEmails: (opts.internalEmails ?? []).map((e) => e.toLowerCase()),
    };
    const lookbackHours = opts.lookbackHours ?? 48;
    const since = new Date(Date.now() - lookbackHours * 3600_000);

    const granola = new GranolaClient(apiKey);
    const items = await granola.listNotes();
    const recent = items.filter((n) => n.created_at && new Date(n.created_at) >= since);
    log(`[${feed.name}] granola: ${items.length} note(s) total, ${recent.length} within ${lookbackHours}h`);

    const out: SourceItem[] = [];
    for (const item of recent) {
      const note = await granola.getNote(item.id);
      if (!isCustomerMeeting(note, rules)) {
        log(`[${feed.name}] filter: skip "${sanitizeName(note.title ?? "untitled")}" (no external attendee)`);
        continue;
      }
      out.push(composeEntry(note, rules));
    }
    return out;
  },
};
