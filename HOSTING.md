# Hosting this site on GitHub (GitHub Pages)

This is a **pure static site** — just HTML, CSS and vanilla JS, no build step and no
server. That makes **GitHub Pages** the easiest free way to put it online.

The site uses **relative paths** (`css/…`, `js/…`) and a **hash router** (`#/home`,
`#/packages`, …), so it works on GitHub Pages with **zero configuration** — even when
served from a sub-path like `https://you.github.io/your-repo/`.

---

## What gets deployed

Everything in this folder:

```
index.html
css/        (reset, variables, base, layout, components, packages, activities, albums, responsive)
js/         (config, data, components, router, main)
apps-script/  (Code.gs + SETUP.md — reference only, not served)
*.md          (docs — harmless to include)
```

> The contact + popup forms POST to your Google Apps Script Web App URL in
> `js/config.js`. That keeps working from any domain, including GitHub Pages.

---

## Option A — Push from your computer (recommended)

### 1. One-time setup
- Create a free account at <https://github.com>.
- Install git: `sudo apt install git` (Ubuntu) and set your identity once:
  ```bash
  git config --global user.name  "Your Name"
  git config --global user.email "you@example.com"
  ```

### 2. Create an empty repository on GitHub
- Go to <https://github.com/new>.
- **Repository name:** e.g. `himalayan-tourism`
- Visibility: **Public** (Pages is free for public repos).
- Do **not** add a README/.gitignore (we'll push our own files).
- Click **Create repository** and copy the repo URL, e.g.
  `https://github.com/your-username/himalayan-tourism.git`

### 3. Push this folder
Run these from inside the project folder
(`/home/kryp/Documents/Kaustav/website`):

```bash
cd /home/kryp/Documents/Kaustav/website

# (optional) ignore local junk
printf "node_modules/\n.DS_Store\n*.log\n" > .gitignore

git init
git add .
git commit -m "Initial commit — Himalayan Tourism static site"
git branch -M main
git remote add origin https://github.com/your-username/himalayan-tourism.git
git push -u origin main
```

> When prompted for a password, use a **Personal Access Token**, not your
> account password: GitHub → Settings → Developer settings →
> Personal access tokens → *Generate new token (classic)* → tick **repo** →
> copy it and paste it as the password.

### 4. Turn on GitHub Pages
- In the repo: **Settings ▸ Pages**.
- **Source:** *Deploy from a branch*.
- **Branch:** `main`, **Folder:** `/ (root)` → **Save**.
- Wait ~1 minute. Your site appears at:

  ```
  https://your-username.github.io/himalayan-tourism/
  ```

That's it — open the URL and the whole SPA (home, packages, activities, albums,
contact) works.

---

## Option B — Upload in the browser (no git)

1. Create the repo as in step 2 above (you *can* tick "Add a README" here).
2. On the repo page: **Add file ▸ Upload files**.
3. Drag in **`index.html`, the `css/` folder and the `js/` folder** (keep the folder
   structure — drag the folders, not just loose files).
4. **Commit changes**.
5. Enable Pages exactly as in step 4 above.

---

## Updating the site later

After you change any file:

```bash
git add .
git commit -m "Describe what changed"
git push
```

GitHub Pages redeploys automatically in ~1 minute (hard-refresh with
`Ctrl/Cmd + Shift + R` if you don't see changes — Pages caches assets).

---

## Optional: a nicer URL

- **User/Org site (root domain):** name the repo `your-username.github.io` and push
  to it — the site then lives at `https://your-username.github.io/` (no sub-path).
- **Custom domain:** Settings ▸ Pages ▸ *Custom domain* → enter e.g.
  `www.himalayantourism.com`, then add the DNS records GitHub shows (a `CNAME`
  record pointing to `your-username.github.io`). Tick **Enforce HTTPS** once it's
  verified.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Page is blank / 404 on assets | Make sure `index.html` is at the **repo root** (or set the Pages folder to wherever it is). Paths are relative, so the folder structure must be preserved. |
| Site doesn't update | Wait a minute, then hard-refresh (`Ctrl+Shift+R`). Check the **Actions** tab for the "pages build and deployment" run. |
| Forms don't reach the Sheet | Confirm the Apps Script Web App URL is set in `js/config.js` and the deployment is set to "Anyone" (see `apps-script/SETUP.md`). |
| Images missing | They're hot-linked from Unsplash; a blocked/expired image just shows the built-in teal gradient fallback — swap in your own images in `js/data.js` for production. |

---

## Other one-click hosts (also free, also no build)

If you'd rather not use Pages, the same folder drops straight onto:
- **Netlify** — drag-and-drop the folder at <https://app.netlify.com/drop> (Netlify
  Forms can replace Apps Script if you prefer).
- **Vercel** — `vercel` CLI or "Import Project" → it serves the static files as-is.
- **Cloudflare Pages** — connect the GitHub repo, framework preset **None**, output
  directory `/`.
