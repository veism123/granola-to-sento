# Set up Granola to Sento (no coding needed)

This courier is a small helper that runs in the cloud and brings your
customer meeting notes from Granola into your Sento workspace, every hour,
automatically. You set it up once, in about fifteen minutes.

Tip: you can hand this whole page to Claude and say "help me set this up".
It will walk you through every step.

## Step 1. Collect your two keys

A key is a long string of letters and numbers that you copy from one place
and paste into another. You never share keys in email or chat.

**Sento key**
1. Open your Sento console and go to your meeting transcripts entity.
2. Under "Who can write?", add a new courier connection and allow it to
   read and write this entity.
3. Open the credentials drawer and create the key. Copy it now. It is
   shown once.
4. Also note your workspace's MCP address from the install guide. It
   looks like `https://app.yourcompany.com/api/mcp`.

**Granola key**
1. Granola desktop app, then Settings, then API keys. This needs a
   Granola Business or Enterprise plan.
2. Create a key (it starts with `grn_`) and copy it.
3. Good to know: this key can read every transcript in your Granola
   workspace, so treat it like a password.

## Step 2. Tell it who "internal" is

Open `feeds.json` and put your company's email domains in
`internalDomains`. A meeting counts as a customer meeting when at least
one attendee's email is from outside those domains. This is how internal
standups stay out of your workspace.

## Step 3. Put it in the cloud

Ask whoever runs your company's servers to deploy this repository as an
always-on worker with the start command `npm start`, entering your keys
as environment variables using the names in `.env.example`. Any modern
host works. There is no database and nothing else to configure.

If that meant nothing to you, forward this page and the repository link
to a technical person, or to Claude. It is ten minutes of work.

## Step 4. Practice run, then go

The courier starts in practice mode (`DRY_RUN=true`). It looks at your
recent meetings and writes a log of what it WOULD add to Sento, adding
nothing. Read that log once. If the list looks right, change `DRY_RUN`
to `false` and the next cycle writes for real.

## How you know it is working

Open Sento. New customer meetings appear within the hour, already named
and summarized. The console's logs page shows everything the courier
wrote, under its own name. It never deletes anything and never adds the
same meeting twice. Turning it off breaks nothing; turning it back on
picks up where it left off.
