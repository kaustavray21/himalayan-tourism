# Connect the forms to Google Sheets (Apps Script)

The website forms (lead popup + contact page) POST to a Google Apps Script
Web App, which appends each submission to your Google Sheet. No server needed.

## 1. Create the Sheet
1. Go to https://sheets.google.com → **Blank spreadsheet**.
2. Rename it e.g. **tourism-leads**.
   (Keep the default **Sheet1** and **Sheet2** tabs. The script writes
   popup leads → **Sheet1** and contact-form enquiries → **Sheet2**, and
   adds the header row automatically on first submission.)

## 2. Add the Apps Script
1. In the Sheet: **Extensions ▸ Apps Script**.
2. Delete the default `function myFunction() {}`.
3. Paste the entire contents of `apps-script/Code.gs`.
4. Click **Save** (💾).

## 3. Deploy as a Web App
1. Top right: **Deploy ▸ New deployment**.
2. Click the gear ⚙ next to "Select type" → choose **Web app**.
3. Set:
   - **Description:** anything (e.g. "forms v1")
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**   ← required so the site can POST
4. Click **Deploy**.
5. **Authorize access** when prompted → pick your Google account →
   "Google hasn't verified this app" → **Advanced ▸ Go to (project) (unsafe)**
   → **Allow**. (It's your own script; this is normal.)
6. Copy the **Web app URL** — it ends in `/exec`, like:
   `https://script.google.com/macros/s/AKfy....../exec`

## 4. Paste the URL into the site
Open `js/config.js` and replace the placeholder:

```js
const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfy....../exec";
```

Save. That's it — the lead popup and contact form now write to your Sheet.

## 5. Test
- Open the site, submit the popup (name + phone) and the contact form.
- Check the Sheet — **Sheet1** fills from the popup, **Sheet2** from the contact form.
- You can also open the `/exec` URL in a browser; it should say
  *"Himalayan Tourism form endpoint is live."*

---

## Updating the script later (IMPORTANT)
If you edit `Code.gs`, the live URL keeps serving the OLD code until you
redeploy a new version:
**Deploy ▸ Manage deployments ▸ (pencil/Edit) ▸ Version: New version ▸ Deploy.**
The URL stays the same.

## Optional: block spam with a shared secret
1. In `Code.gs` set `var SECRET = "some-long-random-string";` and redeploy.
2. In `js/config.js` add the same token to every submission by changing the
   helper call — ping me and I'll wire `token` into `UI.submitToSheet`.

## How it works (why no CORS errors)
The site sends a "simple" `application/x-www-form-urlencoded` POST with
`mode:"no-cors"`, so the browser never blocks it. The response is opaque
(we can't read it), so the UI shows success once the request is sent —
client-side validation already ran. Data still lands in the Sheet reliably.
