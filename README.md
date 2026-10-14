# Telegram Bot: Reminder Bot — Free & Open Source 🤖

**Reminder Bot** is a free, open-source Telegram bot that creates one-time or recurring reminders using natural date and time commands and receives notifications in Telegram. Self-host it for free on Cloudflare Workers — full source code included (MIT).

> 🪪 **License:** MIT — free for personal and commercial use.

---

## ✨ Features

- Set reminders with a date
- Scheduled notifications
- KV-backed
- Cron driven
- Open source

---

## 🧱 Tech stack

| Component | Choice |
| --- | --- |
| Runtime | Cloudflare Workers |
| Web framework | [Hono](https://hono.dev) |
| Storage | Cloudflare KV (`BOT_KV`) |
| Scheduling | Cloudflare Cron Triggers |
| Bot transport | Telegram Bot API (webhooks) |

---

## 📋 Prerequisites

- A **Cloudflare account** (free tier is fine — no credit card needed).
- A **Telegram account** (to talk to [@BotFather](https://t.me/BotFather)).
- *(Only for Method 2 / the CLI method)* **Node.js** (v18+) and **npm** installed.

---

## 🚀 Step-by-step setup & deployment

You can deploy this bot in **two ways**. Both end up with the same working bot on Cloudflare's free plan — pick whichever you prefer:

- **Method 1 — Manual (Cloudflare Dashboard):** no code tools, done entirely in the browser.
- **Method 2 — Cloudflare CLI (Wrangler):** the local method using your terminal.

### Method 1 — Manual (Cloudflare Dashboard, no code tools needed)

> If you don't have a Cloudflare account yet, create one free at <https://dash.cloudflare.com/sign-up> (no credit card needed).

1. **Create your Telegram bot**
   1. Open [@BotFather](https://t.me/BotFather) in Telegram and send `/newbot`.
   2. Pick a **name** and a **username** that ends in `bot`.
   3. Copy the **HTTP API token** it returns and keep it secret.

2. **Create the Worker**
   1. In the Cloudflare dashboard go to **Workers & Pages → Create → Create Worker**.
   2. Name it `telegram-bot-reminder-bot` and click **Deploy** (you'll land in the code editor).
   3. Delete the sample code, paste the **full contents of `worker.js`** from this repo, then click **Deploy** again. (Cloudflare bundles the `hono` dependency automatically; if the editor flags a missing module, add the `hono` package from **Packages** and redeploy.)

3. **Add the required bindings** — open the Worker, go to **Settings → Bindings**, and add:
   - **KV namespace** — click **Add binding → KV namespace**, create a new namespace (name it anything, e.g. `bot-kv`), and bind it with the **variable name `BOT_KV`**, then Save.
   - **Cron Trigger** — go to **Triggers → Cron Triggers**, add a trigger with schedule `*/15 * * * *` (every 15 minutes), and Save. *(Cron Triggers are included in the Free plan; if your account doesn't offer them, the bot still works on demand — only the automatic background checks won't run.)*
   - **Bot token** — under **Variables**, add `BOT_TOKEN` as an **Encrypt** (secret) variable, paste your token, then **Save**.
   - Click **Deploy** / **Redeploy** so the new bindings take effect.

4. **Point Telegram at your bot** — open this URL in your browser (use your Worker's real URL, shown in the dashboard; `<subdomain>` is your account's `*.workers.dev` subdomain):
   ```
   https://telegram-bot-reminder-bot.<subdomain>.workers.dev/register
   ```
   You should see `{"ok":true,...}`. ✅ Done — send the bot a message.

### Method 2 — Cloudflare CLI (Wrangler)

### 1. Create a Cloudflare account

1. Go to <https://dash.cloudflare.com/sign-up>.
2. Sign up with your email (or Google/Apple).
3. Verify your email.
4. No credit card is needed for the free plan.

### 2. Install Wrangler

```bash
npm install -g wrangler
wrangler login
wrangler --version
```

### 3. Create your Telegram bot

1. Start a chat with [@BotFather](https://t.me/BotFather).
2. Send `/newbot`.
3. Choose a **name** and a **username** ending in `bot`.
4. Keep the returned token secret.

### 4. Get the project

```bash
git clone https://github.com/botlabz/telegram-bot-reminder-bot.git
cd telegram-bot-reminder-bot
npm install
```

### 5. Configure the bot token

```bash
wrangler secret put BOT_TOKEN
# paste your token when prompted
```

Also create a KV namespace and add it to wrangler.toml:
```bash
wrangler kv namespace create BOT_KV
```


### 6. Run locally & deploy

```bash
wrangler dev        # local testing
wrangler deploy      # live at https://telegram-bot-reminder-bot.<subdomain>.workers.dev
```

### 7. Connect the webhook

باز کنید در مرورگر: / Open in browser:

```text
https://telegram-bot-reminder-bot.<your-subdomain>.workers.dev/register
```

✅ Done! Send the bot a message.

---

## 💬 Usage

| Command | What it does |
| --- | --- |
| `/track` <name> <YYYY-MM-DD> | Add a reminder |
| `/untrack` <n> | Stop tracking #n |
| `/list` | List tracked items |
| `/check` | Check now |
| `/help` | Show help |

---

## 🗂 Project structure

```text
telegram-bot-reminder-bot/
├── worker.js      # complete bot code (single file)
├── wrangler.toml    # Cloudflare Workers config
├── package.json
├── .gitignore
├── LICENSE          # MIT
├── README.md        # English
└── README.fa.md     # Persian
```

---

## 🔧 Customization

- Edit commands, help text and messages in `worker.js`.
- For AI bots, change the system prompt in `CONFIG.system`.
- For trackers, adjust the type and sources in `CONFIG`.

---

## 🆓 Free & open source

This project is released under the **MIT License** — free for personal and commercial use.

---

## 🤖 More free Telegram bots

Part of a free, open-source Telegram bot collection by [botlabz](https://github.com/botlabz):

- [AI Code Fixer](https://github.com/botlabz/telegram-bot-ai-code-fixer)
- [AI Content Generator](https://github.com/botlabz/telegram-bot-ai-content-generator)
- [AI Document Chat](https://github.com/botlabz/telegram-bot-ai-document-chat)
- [AI File Analyzer](https://github.com/botlabz/telegram-bot-ai-file-analyzer)
- [AI GitHub Tracker](https://github.com/botlabz/telegram-bot-ai-github-tracker)
- [AI News Digest](https://github.com/botlabz/telegram-bot-ai-news-digest)

Browse all bots in the [tele-bot](https://github.com/botlabz/tele-bot) org.

---

Let's Build Something Together 🚀

https://tally.so/r/q4q1L9
