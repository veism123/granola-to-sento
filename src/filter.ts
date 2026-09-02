import type { GranolaNote } from "./granola.js";

export interface FilterRules {
  internalDomains: string[];
  internalEmails: string[];
}

function isInternal(email: string, rules: FilterRules): boolean {
  const lower = email.toLowerCase();
  if (rules.internalEmails.includes(lower)) return true;
  const domain = lower.split("@")[1] ?? "";
  return rules.internalDomains.includes(domain);
}

// A customer meeting has at least one external attendee. A note with no
// attendee emails at all does NOT qualify: without evidence of an external
// party we must not sweep a possibly-internal conversation into a shared
// entity, so the filter fails closed.
export function isCustomerMeeting(note: GranolaNote, rules: FilterRules): boolean {
  const emails = (note.attendees ?? [])
    .map((a) => a.email)
    .filter((e): e is string => typeof e === "string" && e.includes("@"));
  if (emails.length === 0) return false;
  return emails.some((e) => !isInternal(e, rules));
}

// The entry name leads with the customer, per the entity's authoring guide.
// Derived deterministically: the second-level domain label of the first
// external attendee's email, capitalized ("pauliina@kundo.se" -> "Kundo").
export function customerLabel(note: GranolaNote, rules: FilterRules): string {
  for (const a of note.attendees ?? []) {
    const email = a.email?.toLowerCase();
    if (!email || !email.includes("@")) continue;
    if (rules.internalEmails.includes(email)) continue;
    const domain = email.split("@")[1] ?? "";
    if (rules.internalDomains.includes(domain)) continue;
    const label = domain.split(".")[0] ?? "";
    if (label) return label.charAt(0).toUpperCase() + label.slice(1);
  }
  return "Unknown customer";
}

// External strings (titles, names) become part of the entry name, which
// renders in the server's shortlist. Constrain them: strip double quotes
// (entity names exclude them) and control characters, collapse whitespace,
// bound the length.
export function sanitizeName(raw: string, maxLen = 80): string {
  const cleaned = raw
    .split("")
    .map((ch) => {
      if (ch === '"') return "";
      const code = ch.charCodeAt(0);
      return code < 0x20 || code === 0x7f ? " " : ch;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, maxLen).trim() || "Untitled meeting";
}
