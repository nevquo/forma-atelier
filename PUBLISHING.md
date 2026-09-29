# Publish FORMA Atelier — simple steps

## 1. Keep a backup

In GitHub, open `nevquo/forma-atelier` → Code → Download ZIP. Keep that copy. Extract this new project ZIP into a separate folder on your computer.

This version is different from the old upload: **upload the full project, not only public or dist**. The repository root must contain `package.json`, `wrangler.jsonc`, `src`, `public`, `db` and `tests`.

## 2. Update GitHub with GitHub Desktop

Folder uploads caused trouble earlier, so use GitHub Desktop for this update.

1. Install GitHub Desktop from https://desktop.github.com/ and sign in to the same GitHub account.
2. File → Clone repository → select `nevquo/forma-atelier` → choose a new local folder → Clone.
3. Check that Current branch is `main`, then Fetch origin / Pull origin if offered.
4. Repository → Show in Explorer. This is the local copy of the GitHub repository.
5. Remove the **old FORMA website files only** from this local copy: old root HTML pages, old `assets/`, `dist/`, `functions/`, `.openai/`, old deployment documents and any old `wrangler.toml` or `wrangler.json`. Keep the repository’s `.git` folder. Preserve unrelated files; if there are any you do not recognise, stop and review them first. The old files remain recoverable from Git history and your backup.
6. Copy the contents of this new project folder into the local repository. Replace same-named project files when prompted. Do not copy the enclosing ZIP folder as another nested directory.
7. GitHub Desktop now shows the changes. Review the list. Do not include credentials or enquiry exports.
8. Summary: `Rebuild FORMA Atelier concept website v2`. Click Commit to main, then Push origin.

If GitHub Desktop reports a conflict or protected branch requirement, stop and follow the repository's review workflow; do not force-push.

## 3. Configure the existing Cloudflare Worker

Your screenshots show a Worker, not a Pages project. Keep using it.

1. Cloudflare → Compute → Workers & Pages → `forma-atelier`.
2. Open Settings → Build (or Builds), and edit the Git build settings.
3. Repository: `nevquo/forma-atelier`; production branch: `main`.
4. Root directory: repository root (`/`).
5. Build command: `npm run build`.
6. Deploy command: `npx wrangler deploy`.
7. Save and trigger/retry the build for the latest commit. No Pages output-directory field is required: `wrangler.jsonc` specifies `./public`.
8. Open Domains. Enable the **Production workers.dev URL** if its switch is off. The earlier screenshots showed that switch off; a successful build alone does not prove the URL is publicly reachable.
9. Visit https://forma-atelier.nevquo.workers.dev/ in an incognito window. If Cloudflare shows a different URL, use that URL and update `site.url` in `src/content.mjs`, then commit/push.

The website should now work, with a clear email alternative and the form disabled. This is intentional until step 4 is complete. `workers_dev: true` is also set in the supplied config. Check Cloudflare plan quotas before promotion; this package does not guarantee unlimited free usage.

## 4. Enable real enquiry storage

This uses Cloudflare D1, not a mailbox. It saves enquiries for you to review. It does NOT send email notifications.

### A. Create the database

1. In the Cloudflare account, open Storage & databases → D1.
2. Create a **new** database named `forma-inquiries-v2`. Do not reuse the original schema without a migration.
3. Open its Console. Paste and run the SQL in `db/schema.sql`.
4. Copy the database ID from its overview. This ID is not a password.
5. Edit `wrangler.jsonc` locally. Add this top-level property after the `assets` property, with commas between properties:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "forma-inquiries-v2",
    "database_id": "PASTE-YOUR-ACTUAL-DATABASE-ID"
  }
],
```

Keep this binding in the configuration file rather than relying on a dashboard-only binding that a later deployment might replace.

### B. Create Turnstile spam protection

1. In Cloudflare, open Turnstile → Add widget.
2. Name: `FORMA enquiries`. Choose Managed mode.
3. Add hostname `forma-atelier.nevquo.workers.dev` (or the actual production hostname). Do not add `https://` or a path.
4. Copy the **site key** into `TURNSTILE_SITE_KEY` under `vars` in `wrangler.jsonc`.
5. In the Worker’s Settings → Variables and Secrets, add a **Secret** named `TURNSTILE_SECRET_KEY` with the secret key. Never put the secret in GitHub or send it in chat.
6. Change `FORM_ENABLED` from `"false"` to `"true"` in `wrangler.jsonc`.
7. Commit and push the config changes. Wait for the new build to succeed. Refresh the contact page.

### C. Test and review messages

1. Submit one clearly labelled test enquiry using your own email address, complete the checkbox and security check.
2. Confirm the page shows a reference. Copy it.
3. D1 → `forma-inquiries-v2` → Console. Run:

```sql
SELECT reference, name, email, project_type, message, created_at
FROM inquiries ORDER BY created_at DESC LIMIT 20;
```

4. Confirm the test message is stored once and the reference matches.
5. Test invalid email, missing consent and a failed security check. None should create a message.
6. Review the database regularly and reply from your NEVQUO mailbox. Remove unneeded enquiries under your retention policy. Review privacy.html wording with your actual handling; it is not legal certification.

If the form stays disabled, check all four requirements: `FORM_ENABLED=true`, D1 binding `DB`, nonempty public site key, and the secret. If a submission fails, check the Turnstile hostname and that the SQL schema was installed. The API never returns a success for a failed database write.

## 5. Is a subdomain required?

No. The workers.dev address is valid for a public concept demo. Keep your main NEVQUO WordPress site and email unchanged.

Only if `nevquo.com` is already an active Cloudflare zone in the **same account**: Worker → Domains → Add Domain → `forma.nevquo.com`. Add that hostname to Turnstile too, update `site.url` in `src/content.mjs`, and push a new build.

If you see “No zones match”, stop. A Worker custom domain needs the appropriate Cloudflare zone. Do not change nameservers or create an arbitrary CNAME just to work around it. You can use workers.dev now and plan a DNS migration separately after checking all website and mail records. Never attach this Worker to the root `nevquo.com` or `www.nevquo.com`.

## 6. Final browser checks

- Open Home, Work, Services, Studio, Contact, Privacy and Project notes.
- Open all five studies and the next-study links.
- Filter Homes (2), Interiors (2), Hospitality (1), then All (5).
- Test the mobile menu and Escape key at a narrow screen width.
- Use Tab to reach links and controls; ensure focus is visible.
- Check desktop and mobile for missing images, overflow and browser-console errors.
- Load an unknown path to check the 404 page.
- Confirm a real test enquiry in D1 before saying the form works.
- Open the public URL while signed out. A green build icon is not an end-to-end test.

## 7. Add to your NEVQUO portfolio

Create a project named “FORMA Atelier — architecture studio website concept”. Use screenshots of this version, add the working demo URL, and describe the project as independent and AI-assisted. Discuss the brief, page structure, design decisions and implementation. Do not invent a client, project outcome or performance measurement.

## Updating later / rollback

Edit project text in `src/content.mjs`; other page copy and shared HTML in `src/build.mjs`; styles and browser behavior in `public/assets/`. Do not edit only generated HTML: the next build will replace it. Commit and push to deploy. For an accidental release, use Cloudflare’s deployment rollback to a previously working version or revert the relevant commit with GitHub Desktop. Rollback does not undo database changes.

Official references:
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/wrangler/configuration/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
