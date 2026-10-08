# CareStudyHub — Made by MARC ASHER
A caregiving study app: 10 chapters, 65 oral Q&A, offline tutor, quizzes, flashcards, practice. Works offline and installs like an app.

## 1) Put it online with GitHub Pages (free)
1. github.com → **New repository** → name it `carestudyhub` → Public → Create.
2. **uploading an existing file** → drag ALL files/folders from this zip (not the zip itself) → **Commit changes**.
3. **Settings → Pages → Branch: main / (root) → Save**. Wait ~1 minute. Your link: `https://YOURNAME.github.io/carestudyhub/`
4. Open it on your phone → **Add to Home Screen**.
(Before you share the link, the app works for everyone on their own phone, saved on that phone only.)

## 2) Turn on accounts + moderator (free Cloudflare, ~10 min, optional)
1. dash.cloudflare.com → **Workers & Pages → Create → Worker** → name `carehub-cloud` → Deploy → **Edit code** → paste `server/worker.js` → Deploy.
2. **Storage & Databases → KV → Create namespace** `carehub`. Worker → **Settings → Bindings → Add → KV namespace** → variable name **DB** → pick `carehub`.
3. Worker → **Settings → Variables and Secrets → Add** → Secret named **MOD_KEY** → your private moderator password.
4. (Optional free AI fallback) Bindings → Add → **Workers AI** → variable name **AI**.
5. Open your site at `…/#mod` → paste the worker URL + your MOD_KEY → Unlock.
6. Tap **🔗 Share** — the link it copies already includes the worker URL. Send it to students.

Students: type name + PIN once → progress saves online, log in on any phone. You see everyone in **Moderator**. Edit lessons in **Edit content → Publish**: everyone gets the update; the offline AI learns it automatically.

## Files
`js/data/topics.js` chapters · `js/data/qa.js` 65 Q&A · `js/data/extras.js` AI phrasings · `server/worker.js` cloud · `js/config.js` optional worker URL.
After changing files on GitHub, bump `V` in `sw.js` so phones update.
