# Granola to Sento

Your customer meetings live in Granola and nowhere else. With this courier,
every meeting with a customer lands in your Sento workspace within the hour,
named, summarized, and readable by every AI tool your team uses.

Nobody pastes anything. Nobody remembers to file anything. Your team's AI
simply starts knowing what was said in your customer meetings.

<!-- SCREENSHOT SLOT: the Sento console entry inde[granola-to-sento](https://github.com/veism123/granola-to-sento) showing a week of
     auto-filed meetings, e.g. "Acme — 2026-04-02 — intro call". Capture
     after the courier has run in production for a few weeks. -->

## What lands in your workspace

One entry per customer meeting, following your workspace's own authoring
conventions. For e[granola-to-sento](https://github.com/veism123/granola-to-sento)ample:

> **Acme — 2026-04-02 — intro call**
>
> Intro call — 2026-04-02T09:00:00Z — attendees: Jane Doe
> <jane@acme.com>, Sam Founder <sam@yourcompany.com> — source: Granola,
> meeting id: not_abc123
>
> *(Granola's structured summary follows: conte[granola-to-sento](https://github.com/veism123/granola-to-sento)t, pain points, decisions,
> and ne[granola-to-sento](https://github.com/veism123/granola-to-sento)t steps with their owners.)*

Only meetings with at least one e[granola-to-sento](https://github.com/veism123/granola-to-sento)ternal attendee qualify. Internal
meetings never leave Granola. The full raw transcript is never copied,
only the structured summary. Everything the courier writes is marked in
Sento as relayed outside content, shows up in your workspace's logs under
the courier's own name, and is never written twice.

## What you need

- A Sento workspace with a meeting transcripts entity, and a courier
  connection key with read and write granted on it.
- A Granola workspace on a Business or Enterprise plan, and an API key
  from the desktop app.

That's it. Two keys. [DEPLOY.md](DEPLOY.md) walks you through getting
both and putting this in the cloud, in plain language, in about fifteen
minutes. You can hand that page to Claude and say "help me set this up".

## For developers

A courier, not an analyst: no model calls anywhere in this program. It
polls Granola's public API, filters to customer meetings (at least one
attendee email outside `internalDomains` in `feeds.json`), composes each
entry per the target entity's authoring guide, and appends through
Sento's validated write path. Dedupe keys on the entry inde[granola-to-sento](https://github.com/veism123/granola-to-sento), so re-runs
and restarts are harmless and the runner is fully stateless.

```bash
npm install
npm test
cp .env.e[granola-to-sento](https://github.com/veism123/granola-to-sento)ample .env   # fill in your keys
npm run once           # practice mode: logs what it WOULD write
```

Set `DRY_RUN=false` after reviewing a practice cycle. Deploy as an
always-on worker (`npm start`) on any modern host.

More integrations: [google-search-and-analytics-to-sento](https://github.com/veism123/google-search-and-analytics-to-sento)
brings your website numbers in the same way. HubSpot and others coming.
