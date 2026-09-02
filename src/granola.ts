const BASE = "https://public-api.granola.ai/v1";

// Verified against the live API 2026-09-01:
// - GET /v1/notes returns { notes, hasMore, cursor }; list items are thin
//   (id, object, title, owner, created_at, updated_at) — no attendees, no
//   summary. Server-side date filtering is not relied on; callers filter
//   by created_at client-side.
// - GET /v1/notes/{id} returns the full note: attendees as { name, email },
//   summary_text and summary_markdown, plus private_notes_* fields.
//   Private notes are never read by this courier, and per the entity's
//   authoring guide the raw transcript is never written, so it is not
//   requested (?include=transcript exists but is unused).
export interface GranolaAttendee {
  email?: string;
  name?: string;
}

export interface GranolaNoteListItem {
  id: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GranolaNote extends GranolaNoteListItem {
  attendees?: GranolaAttendee[];
  summary_text?: string;
  summary_markdown?: string;
}

export class GranolaClient {
  constructor(private apiKey: string) {}

  private async get(path: string): Promise<unknown> {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) {
      throw new Error(`Granola ${path} returned ${res.status}: ${await res.text()}`);
    }
    return res.json();
  }

  async listNotes(): Promise<GranolaNoteListItem[]> {
    const notes: GranolaNoteListItem[] = [];
    let cursor: string | undefined;
    let hasMore = true;
    while (hasMore) {
      const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
      const page = (await this.get(`/notes${qs}`)) as {
        notes?: GranolaNoteListItem[];
        hasMore?: boolean;
        cursor?: string;
      };
      notes.push(...(page.notes ?? []));
      hasMore = Boolean(page.hasMore) && Boolean(page.cursor);
      cursor = page.cursor;
    }
    return notes;
  }

  async getNote(id: string): Promise<GranolaNote> {
    return (await this.get(`/notes/${encodeURIComponent(id)}`)) as GranolaNote;
  }
}
