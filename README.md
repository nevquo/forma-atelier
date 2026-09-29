# FORMA Atelier — NEVQUO concept / v2

A deliberately small, editorial architecture-studio website concept. This is an AI-assisted portfolio project, not a commissioned architecture practice or a claim of exclusively human authorship. All five architectural images are generated concept visualisations retained from the original package.

## Start here

Read **PUBLISHING.md**. It is written for the existing `nevquo/forma-atelier` GitHub repository and `forma-atelier` Cloudflare **Worker**. Do not create a Pages project or change the main domain's nameservers just to publish this demo.

## Structure

- `public/`: only the files visitors can download; 13 generated pages, images and CSS/JS.
- `src/content.mjs`: project briefs, image metadata, site URL and email.
- `src/build.mjs`: shared layout and page content. Run `npm run build` after editing.
- `src/worker.js`: same-origin enquiry API with validation, Turnstile verification and D1 storage.
- `db/schema.sql`: schema for a new v2 enquiry database.
- `tests/`: Node tests for file references and API behavior.
- `wrangler.jsonc`: authoritative Worker configuration.

Node 22 or newer is recommended. The build and unit tests have no npm dependencies.

```
npm run build
npm test
npm run preview
```

Open http://localhost:4173. The local static preview deliberately disables submission. Use `npx wrangler dev` for Worker integration testing after configuration. Never commit `.dev.vars`, credentials, customer submissions or database exports.

## Form behavior

The release defaults to email-only mode. The online form is visibly disabled until `FORM_ENABLED`, D1 and both Turnstile keys are configured. Enabled submissions are stored in D1, with a unique reference returned only after a successful insert. No email notifications or autoresponders are included: the operator must review D1 or use the published email link. No public admin endpoint exists.

## Editorial decisions

Removed fake locations, completion dates, floor areas, response promises and implied client outcomes. Replaced vague slogans with specific, conditional concept decisions. Used one image per study instead of repeating the same image as several purported views. Contact points to NEVQUO; illustrative architectural services are identified as such. System sans-serif typography, restrained olive/stone colours, no dependency on external fonts or animation libraries.

## Before public promotion

Confirm the contact mailbox, read and approve the copy, verify the privacy text against actual handling, test deployment and submission end to end, and review image usage. The images are not proof of built work. Do not claim accessibility certification, client results or performance scores without live evidence. Retain your original ZIP as a backup.
