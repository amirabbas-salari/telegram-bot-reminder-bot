// AUTO-GENERATED — Telegram bot on Cloudflare Workers (single-file deployment).
// Scaffold head: imports, app, Telegram helpers. Engine code is appended after CONFIG.
import { Hono } from "hono";

const app = new Hono();

const api = (env) => `https://api.telegram.org/bot${env.BOT_TOKEN}`;

const HELP = `🤖 Reminder Bot

Create one-time or recurring reminders using natural date and time commands and receive notifications in Telegram

Available commands:
/track <name> <YYYY-MM-DD> – Add a reminder
/untrack <n> – Stop tracking #n
/list – List tracked items
/check – Check now
/help – Show help

/help – show this message`;

// ===========================================================================
// Telegram helpers
// ===========================================================================
async function sendMessage(chatId, text, env, extra = {}) {
  return fetch(`${api(env)}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: String(text).slice(0, 4096), ...extra }),
  });
}

async function sendChatAction(chatId, action, env) {
  return fetch(`${api(env)}/sendChatAction`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action }),
  });
}

async function sendPhoto(chatId, bytes, caption, env, filename = "image.png") {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("photo", new Blob([bytes], { type: "image/png" }), filename);
  if (caption) form.append("caption", caption.slice(0, 1024));
  return fetch(`${api(env)}/sendPhoto`, { method: "POST", body: form });
}

async function sendDocument(chatId, bytes, filename, caption, env) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("document", new Blob([bytes]), filename);
  if (caption) form.append("caption", caption.slice(0, 1024));
  return fetch(`${api(env)}/sendDocument`, { method: "POST", body: form });
}

async function sendLong(chatId, text, env) {
  text = String(text || "");
  const MAX = 4000;
  if (text.length <= MAX) return sendMessage(chatId, text, env);
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + MAX);
    await sendMessage(chatId, chunk, env);
    i += MAX;
  }
}

const CONFIG = {
  "name": "Reminder Bot",
  "type": "reminder"
};

// ===== ENGINE: monitor =====
// ENGINE: monitor — fetch-based trackers + scheduled alerts.
// CONFIG: { type } where type in:
//   crypto | stock | currency | github | github_trending | rss | uptime |
//   url_change | package | job | reminder
const KV = (env) => env.BOT_KV;

async function tracks(env, chatId) {
  if (!KV(env)) return [];
  const v = await KV(env).get("t:" + chatId, "json");
  return Array.isArray(v) ? v : [];
}
async function saveTracks(env, chatId, arr) {
  if (!KV(env)) return;
  await KV(env).put("t:" + chatId, JSON.stringify(arr));
}

// --- fetch current value for a tracked item --------------------------------
async function fetchCurrent(item) {
  try {
    switch (item.kind) {
      case "crypto": {
        const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${item.symbol}&vs_currencies=usd`);
        const j = await r.json();
        const v = j[item.symbol]?.usd;
        return v != null ? { value: v, text: `${item.symbol}: $${v}` } : null;
      }
      case "stock": {
        const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${item.symbol}`);
        const j = await r.json();
        const v = j?.chart?.result?.[0]?.meta?.regularMarketPrice;
        return v != null ? { value: v, text: `${item.symbol}: $${v}` } : null;
      }
      case "currency": {
        const r = await fetch(`https://open.er-api.com/v6/latest/${item.base}`);
        const j = await r.json();
        const v = j?.rates?.[item.quote];
        return v != null ? { value: v, text: `1 ${item.base} = ${v} ${item.quote}` } : null;
      }
      case "github": {
        const r = await fetch(`https://api.github.com/repos/${item.repo}`, { headers: { "user-agent": "bot" } });
        const j = await r.json();
        return { value: j.stargazers_count, text: `${item.repo}: ⭐${j.stargazers_count} 🐞${j.open_issues_count}` };
      }
      case "domain": {
        const name = item.domain;
        const r = await fetch(`https://rdap.org/domain/${name}`, { headers: { "user-agent": "bot" } });
        if (r.status === 404) return { value: 0, text: `✅ ${name} appears AVAILABLE.` };
        const j = await r.json().catch(() => ({}));
        const status = j.status || "registered";
        return { value: 1, text: `🔒 ${name} is TAKEN (status: ${status}).` };
      }
      case "github_trending": {
        const r = await fetch("https://github.com/trending", { headers: { "user-agent": "bot" } });
        const html = await r.text();
        const repos = (html.match(/<h2[^>]*>\s*<a[^>]*href="\/([^"]+\/[^"]+)"/g) || [])
          .map((s) => s.match(/href="\/([^"]+\/[^"]+)"/)[1])
          .slice(0, 15);
        return { value: repos.length, text: "🔥 Trending:\n" + repos.map((r) => "• " + r).join("\n") };
      }
      case "rss": {
        const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(item.url)}`);
        const j = await r.json();
        const top = (j.items || []).slice(0, 5).map((it) => `• ${it.title}`).join("\n");
        return { value: j.items?.length || 0, text: `📰 ${item.url}\n${top}` };
      }
      case "uptime":
      case "url_change": {
        const r = await fetch(item.url, { headers: { "user-agent": "bot" } });
        const body = await r.text();
        const hash = body.length + ":" + (body.match(/<title>([^<]*)<\/title>/i)?.[1] || "");
        return { value: r.status, text: `${item.url} → HTTP ${r.status}`, changed: hash !== item.lastHash, hash };
      }
      case "package": {
        // Best-effort: a carrier API key (TRACKING_API_KEY) enables live status.
        if (env.TRACKING_API_KEY) {
          const r = await fetch(`https://api.17track.net/track/v2.2/gettrackinfo`, {
            method: "POST",
            headers: { "17token": env.TRACKING_API_KEY, "content-type": "application/json" },
            body: JSON.stringify({ number: item.num }),
          });
          const j = await r.json();
          const st = j?.data?.list?.[0]?.track?.z0?.[0]?.a || "in transit";
          return { value: st, text: `📦 ${item.num}: ${st}` };
        }
        return { value: "pending", text: `📦 ${item.num} — set TRACKING_API_KEY for live status, or track at your carrier's site.` };
      }
      case "job": {
        const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent("https://remoteok.com/remote-jobs.rss")}`);
        const j = await r.json();
        const found = (j.items || [])
          .filter((it) => (it.title + " " + (it.description || "")).toLowerCase().includes((item.keyword || "").toLowerCase()))
          .slice(0, 5)
          .map((it) => `• ${it.title} — ${it.link}`)
          .join("\n");
        return { value: (j.items || []).length, text: found ? `💼 Jobs for "${item.keyword}":\n${found}` : `No new jobs for "${item.keyword}".` };
      }
      case "reminder": {
        return { value: item.due, text: `${item.name} (due ${item.due})` };
      }
      default:
        return null;
    }
  } catch (e) {
    console.error("fetchCurrent error", e);
    return null;
  }
}

async function engineHandle(message, env, cmd, args, chatId) {
  if (!KV(env)) {
    await sendMessage(chatId, "⚠️ Storage (BOT_KV) not configured. Add a KV namespace (see README).", env);
    return true;
  }
  const arr = await tracks(env, chatId);

  switch (cmd) {
    case "track": {
      if (!args) { await sendMessage(chatId, trackUsage(), env); return true; }
      let item = buildItem(args);
      if (!item) { await sendMessage(chatId, trackUsage(), env); return true; }
      const cur = await fetchCurrent(item);
      if (cur && cur.hash) item.lastHash = cur.hash;
      arr.push(item);
      await saveTracks(env, chatId, arr);
      await sendMessage(chatId, `🔔 Tracking: ${item.label}`, env);
      return true;
    }
    case "untrack":
    case "unwatch": {
      const i = parseInt(args, 10) || (arr.length ? arr.length : 0);
      const before = arr.length;
      const next = arr.filter((_, idx) => idx + 1 !== i);
      await saveTracks(env, chatId, next);
      await sendMessage(chatId, before === next.length ? "Nothing to remove." : `🗑 Stopped tracking #${i}.`, env);
      return true;
    }
    case "list": {
      if (!arr.length) { await sendMessage(chatId, "No tracked items. Use /track.", env); return true; }
      const lines = arr.map((it, i) => `${i + 1}. ${it.label}`);
      await sendLong(chatId, "🔔 Tracked:\n" + lines.join("\n"), env);
      return true;
    }
    case "check": {
      for (const it of arr) {
        const cur = await fetchCurrent(it);
        if (!cur) continue;
        if (it.kind === "uptime" || it.kind === "url_change") {
          const changed = cur.changed;
          it.lastHash = cur.hash;
          await saveTracks(env, chatId, arr);
          if (changed) await sendMessage(chatId, `🔔 Changed: ${cur.text}`, env);
          else await sendMessage(chatId, `✅ No change: ${cur.text}`, env);
        } else {
          await sendMessage(chatId, cur.text, env);
        }
      }
      return true;
    }
    default:
      return false;
  }
}

function trackUsage() {
  switch (CONFIG.type) {
    case "crypto": return "Usage: /track <coin-id>  e.g. /track bitcoin";
    case "stock": return "Usage: /track <TICKER>  e.g. /track AAPL";
    case "currency": return "Usage: /track <BASE> <QUOTE>  e.g. /track USD EUR";
    case "github": return "Usage: /track <owner/repo>  e.g. /track cloudflare/workers-sdk";
    case "github_trending": return "Usage: /check  (shows current GitHub trending)";
    case "domain": return "Usage: /track <domain>  e.g. /track example.com";
    case "rss": return "Usage: /track <feed-url>  e.g. /track https://hnrss.org/frontpage";
    case "uptime": return "Usage: /track <url>  e.g. /track https://example.com";
    case "url_change": return "Usage: /track <url>  e.g. /track https://shop.com/product/1";
    case "package": return "Usage: /track <tracking-number>";
    case "job": return "Usage: /track <keyword>  e.g. /track rust";
    case "reminder": return "Usage: /track <name> <YYYY-MM-DD>  e.g. /track Pay rent 2026-09-01";
    default: return "Usage: /track <value>";
  }
}

function buildItem(args) {
  const parts = args.split(/\s+/);
  switch (CONFIG.type) {
    case "crypto": return { kind: "crypto", symbol: parts[0].toLowerCase(), label: parts[0] };
    case "stock": return { kind: "stock", symbol: parts[0].toUpperCase(), label: parts[0].toUpperCase() };
    case "currency": return { kind: "currency", base: parts[0].toUpperCase(), quote: (parts[1] || "USD").toUpperCase(), label: `${parts[0]}/${parts[1] || "USD"}` };
    case "github": return { kind: "github", repo: parts[0], label: parts[0] };
    case "github_trending": return { kind: "github_trending", label: "GitHub trending" };
    case "domain": return { kind: "domain", domain: parts[0].toLowerCase(), label: parts[0].toLowerCase() };
    case "rss": return { kind: "rss", url: parts[0], label: parts[0] };
    case "uptime": return { kind: "uptime", url: parts[0], label: parts[0] };
    case "url_change": return { kind: "url_change", url: parts[0], label: parts[0] };
    case "package": return { kind: "package", num: parts[0], label: parts[0] };
    case "job": return { kind: "job", keyword: parts[0], label: parts[0] };
    case "reminder": {
      const due = parts.pop();
      const name = parts.join(" ") || "reminder";
      if (!/^\d{4}-\d{2}-\d{2}/.test(due)) return null;
      return { kind: "reminder", name, due, label: `${name} (${due})` };
    }
    default: return null;
  }
}

// --- scheduled: scan every chat's tracked items and notify on change/due ---
async function engineScheduled(env) {
  if (!KV(env)) return;
  const { keys } = await KV(env).list({ prefix: "t:" });
  const window = 3 * 24 * 3600 * 1000;
  for (const k of keys) {
    const chatId = k.name.slice(2);
    const arr = await tracks(env, chatId);
    let changed = false;
    for (const it of arr) {
      const cur = await fetchCurrent(it);
      if (!cur) continue;
      if (it.kind === "uptime" || it.kind === "url_change") {
        if (cur.changed) { it.lastHash = cur.hash; changed = true; await sendMessage(chatId, `🔔 Changed: ${cur.text}`, env); }
      } else if (it.kind === "reminder") {
        const due = new Date(it.due).getTime();
        if (!isNaN(due) && !it.reminded && due - Date.now() <= window) {
          await sendMessage(chatId, `⏰ Reminder: ${it.name} is due ${it.due}.`, env);
          it.reminded = true;
          changed = true;
        }
      } else {
        const last = it.lastValue;
        if (last != null && cur.value !== last) {
          await sendMessage(chatId, `🔔 ${it.label} changed: ${last} → ${cur.value}`, env);
        }
        it.lastValue = cur.value;
        changed = true;
      }
    }
    if (changed) await saveTracks(env, chatId, arr);
  }
}

// ===========================================================================
// Message dispatcher
// ===========================================================================
async function handleMessage(message, env) {
  const chatId = message?.chat?.id;
  if (!chatId) return;

  // Non-text messages (photos, documents, voice, etc.) go to the engine if it wants them.
  if (!message.text) {
    if (typeof engineHandleMedia === "function") {
      const ok = await engineHandleMedia(message, env, chatId);
      if (!ok) await sendMessage(chatId, "Send /start to begin, or use /help.", env);
    } else {
      await sendMessage(chatId, "Send /start to begin, or use /help.", env);
    }
    return;
  }

  const text = message.text;
  const m = text.match(/^\/([a-zA-Z0-9_]+)(?:@\S+)?\s*([\s\S]*)$/);

  if (!m) {
    // Plain text message.
    const handled = await engineHandle(message, env, null, text.trim(), chatId);
    if (!handled) await sendMessage(chatId, "Try /help for available commands.", env);
    return;
  }

  const cmd = m[1].toLowerCase();
  const args = m[2].trim();

  if (cmd === "start" || cmd === "help") {
    await sendMessage(chatId, HELP, env);
    return;
  }

  const handled = await engineHandle(message, env, cmd, args, chatId);
  if (!handled) await sendMessage(chatId, `Unknown command "/${cmd}". Try /help.`, env);
}

// Engine may register additional routes (redirects, votes, ...).
if (typeof engineRoutes === "function") engineRoutes(app);

app.get("/", (c) =>
  c.json({ name: CONFIG.name, status: "ok", runtime: "Cloudflare Workers" })
);

// Register the Telegram webhook. Visit /register (or /register?url=https://.../webhook).
app.get("/register", async (c) => {
  const url = new URL(c.req.url);
  const target = url.searchParams.get("url") || `${url.origin}/webhook`;
  const res = await fetch(`${api(c.env)}/setWebhook?url=${encodeURIComponent(target)}`);
  const json = await res.json();
  return c.json(json);
});

app.post("/webhook", async (c) => {
  try {
    const update = await c.req.json();
    if (update.message) await handleMessage(update.message, c.env);
    if (update.edited_message) await handleMessage(update.edited_message, c.env);
    if (update.callback_query && typeof engineHandleCallback === "function") {
      await engineHandleCallback(update.callback_query, c.env);
    }
  } catch (e) {
    console.error("webhook error", e);
  }
  return c.text("OK");
});

// Cron handler (only does work if the engine defines engineScheduled).
export async function scheduled(event, env, ctx) {
  if (typeof engineScheduled === "function") {
    try {
      await engineScheduled(env, event);
    } catch (e) {
      console.error("scheduled error", e);
    }
  }
}

export default app;
