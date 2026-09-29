# Verification and remaining launch checks

## Passed in the build environment

- Generated all 13 HTML pages successfully.
- Checked that every local HTML link and referenced asset exists.
- Checked exactly one H1 per generated page.
- JavaScript syntax checks passed for the browser script and Worker.
- 12 Node tests passed, including disabled-form behavior, config secrecy, cross-origin rejection, request-size limits, invalid email, missing consent, honeypot, missing token, unsupported methods and unknown endpoints.
- Mocked successful Turnstile + D1 flow returns a reference only after storage; mismatched hostname, failed verification and storage failure are rejected.
- Architectural images converted from PNG to WebP; all five assets remain included. Original image subject matter was not changed.

## Not yet verified

- Browser-rendered desktop/mobile layouts and keyboard interactions. Playwright was available, but Chromium was missing and its download failed. No visual QA or Lighthouse/accessibility score is claimed.
- Actual Cloudflare deployment, D1 integration, Turnstile service and live submissions. Unit tests use mocks and do not establish that the external services are configured.
- Mailbox deliverability. The email link uses hello@nevquo.com; the owner must confirm it before launch.

Use the final browser checklist in PUBLISHING.md before sharing the site. The form starts disabled rather than giving a false success. No email delivery service or admin inbox UI is bundled; D1 is the private enquiry store.
