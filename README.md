# Granola to Sento

Your customer meetings live in Granola and nowhere else. With this courier,
every meeting with a customer lands in your Sento workspace within the hour,
named, summarized, and readable by every AI tool your team uses.

Nobody pastes anything. Nobody remembers to file anything. Your team's AI
simply starts knowing what was said in your customer meetings.

<!-- SCREENSHOT SLOT: the Sento console entry index showing a week of
     auto-filed meetings, e.g. "Acme — 2026-04-02 — intro call". Capture
     after the courier has run in production for a few weeks. -->

## What lands in your workspace

One entry per customer meeting, following your workspace's own authoring
conventions. For example:

> **Acme — 2026-04-02 — intro call**
>
> Intro call — 2026-04-02T09:00:00Z — attendees: Jane Doe
> <jane@acme.com>, Sam Founder <sam@yourcompany.com> — source: Granola,
> meeting id: not_abc123
>
> *(Granola's structured summary follows: context, pain points, decisions,
> and next steps with their owners.)*

Only meetings with at least one external attendee qualify. Internal
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
Sento's validated write path. Dedupe keys on the entry index, so re-runs
and restarts are harmless and the runner is fully stateless.

```bash
npm install
npm test
cp .env.example .env   # fill in your keys
npm run once           # practice mode: logs what it WOULD write
```

Set `DRY_RUN=false` after reviewing a practice cycle. Deploy as an
always-on worker (`npm start`) on any modern host.

Built on the [Sento courier framework](https://github.com/veism123/sento-courier).
More integrations: Google Analytics and Search Console, HubSpot, and
others — one small repo each, same fifteen-minute setup.
