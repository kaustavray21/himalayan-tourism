# Security notes

This is a **static, client-side** site (HTML/CSS/vanilla JS) with no backend of its
own — form data is POSTed to a Google Apps Script Web App. The attack surface is small,
but the following hardening is in place, plus a few things to set at the host.

## Already implemented (in the code)

| Area | What we do |
|---|---|
| **XSS — output encoding** | All dynamic text is HTML-escaped via `esc()` before being inserted with `innerHTML` (titles, descriptions, search query echo, review text, etc.). |
| **XSS — no DOM-based sink from the URL** | The hash router only uses the URL fragment to *look up* trusted data (e.g. find a package by `id`); the raw fragment is never written into the DOM. |
| **Content-Security-Policy** | A `<meta http-equiv="Content-Security-Policy">` restricts sources: `script-src 'self'` (no inline or third-party scripts — the main anti-XSS control), `img-src` limited to self/`data:`/Unsplash, `connect-src` limited to self + the Apps Script domains, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`, `upgrade-insecure-requests`. |
| **No inline event handlers** | Removed every `onerror=`/`onload=` attribute so the strict `script-src 'self'` holds. Image-load failures are handled by one capture-phase `error` listener instead. |
| **localStorage tampering** | Wishlist links are passed through `safeRoute()`, which only permits in-app `#/…` routes — a hand-edited `localStorage` entry can't inject a `javascript:` link. CSP also blocks any non-allowed image src a tampered entry might add. |
| **Referrer leakage** | `<meta name="referrer" content="strict-origin-when-cross-origin">`. |
| **No secrets in the client** | The repo contains no API keys/passwords. The Apps Script URL is a public endpoint by design (see below). |

## To set at the host / CDN (can't be done from a `<meta>` tag)

GitHub Pages does **not** let you add custom response headers. If security headers
matter to you, serve the same files from **Netlify** or **Cloudflare Pages**, which do.

**Netlify** — add a `_headers` file at the site root:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), camera=(), microphone=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com; connect-src 'self' https://script.google.com https://script.googleusercontent.com; form-action 'self'; frame-ancestors 'none'
```

Notes:
- Delivering CSP as a **header** (not just meta) also enforces `frame-ancestors`
  (clickjacking protection) — the meta version is ignored for that directive.
- `Strict-Transport-Security` (HSTS) only over HTTPS; GitHub Pages/Netlify/Cloudflare
  all serve HTTPS.

## The forms endpoint (Google Apps Script)

- The Web App is deliberately `Anyone`-accessible so the browser can POST to it. That
  means **anyone can submit** (and could spam) the Sheet.
- Mitigations available in `apps-script/Code.gs`:
  - **Shared secret** — set `var SECRET = "…"` and send the same `token` from the
    client (rejects requests without it). Note: a client-side token is visible in the
    page source, so it only stops casual/automated spam, not a determined attacker.
  - **`LockService`** is already used to avoid race conditions on concurrent writes.
- Don't collect more personal data than you need; the current forms take name + phone
  (+ optional email) for the popup and name/email/phone/message for contact.

## Good ongoing hygiene

- Keep the **Apps Script URL** out of any public bug reports.
- If you swap the hot-linked Unsplash images for your own, host them on the same origin
  (or a domain you add to `img-src`) so CSP keeps protecting you.
- Re-run a scan (e.g. <https://securityheaders.com>, browser DevTools console for CSP
  violations) after deploying.
