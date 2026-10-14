# ربات تلگرام Reminder Bot — رایگان و متن‌باز 🤖

**Reminder Bot** یک ربات تلگرام رایگان و متن‌باز است که ایجاد یادآوری‌های یک‌باره یا دوره‌ای با دستورات تاریخ/زمان طبیعی و دریافت اعلان در تلگرام. سورس ربات روی گیت‌هاب موجود است و روی Cloudflare Workers رایگان میزبانی می‌شود.

> 🪪 **مجوز:** MIT — برای استفاده شخصی و تجاری آزاد است.

---

## ✨ قابلیت‌های پروژه

- تنظیم یادآوری با تاریخ
- اعلان‌های زمان‌بندی‌شده
- مبتنی بر KV
- مبتنی بر cron
- متن‌باز

---

## 🧱 تکنولوژی‌های استفاده‌شده

| بخش | انتخاب |
| --- | --- |
| محیط اجرا | Cloudflare Workers |
| فریم‌ورک وب | [Hono](https://hono.dev) |
| ذخیره‌سازی | Cloudflare KV (`BOT_KV`) |
| زمان‌بندی | Cloudflare Cron Triggers |
| ارتباط با ربات | Telegram Bot API (webhooks) |

---

## 📋 پیش‌نیازها

- یک **حساب کاربری Cloudflare** (پلن رایگان کافیست — نیازی به کارت اعتباری نیست).
- یک **حساب تلگرام** (برای گفتگو با [@BotFather](https://t.me/BotFather)).
- *(فقط برای روش دوم / روش خط فرمان)* **Node.js** (نسخه ۱۸ یا بالاتر) و **npm** نصب‌شده.

---

## 🚀 راهنمای گام‌به‌گام نصب و استقرار

این ربات را به **دو روش** می‌توانید مستقر کنید. هر دو روش همین ربات یکسان را روی پلن رایگان کلودفلر در اختیار شما می‌گذارند — هر کدام که راحت‌ترید انتخاب کنید:

- **روش اول — نصب دستی (داشبورد کلودفلر):** بدون ابزار کد، کاملاً در مرورگر.
- **روش دوم — خط فرمان کلودفلر (Wrangler):** روش محلی با استفاده از خط فرمان.

### روش اول — نصب دستی (داشبورد کلودفلر، بدون نیاز به ابزار کد)

> اگر هنوز حساب کاربری کلودفلر ندارید، ابتدا به‌صورت رایگان در <https://dash.cloudflare.com/sign-up> بسازید (نیازی به کارت اعتباری نیست).

۱. **ساخت ربات تلگرام**
   ۱. در تلگرام گفتگویی با [@BotFather](https://t.me/BotFather) باز کنید و دستور `/newbot` را بفرستید.
   ۲. یک **نام** و یک **نام‌کاربری** که با `bot` تمام شود انتخاب کنید.
   ۳. **توکن HTTP API** که برمی‌گرداند را کپی کنید و محفوظ نگه دارید.

۲. **ساخت Worker**
   ۱. در داشبورد کلودفلر به مسیر **Workers & Pages ← Create ← Create Worker** بروید.
   ۲. نام آن را `telegram-bot-reminder-bot` بگذارید و روی **Deploy** کلیک کنید (وارد ویرایشگر کد می‌شوید).
   ۳. کد نمونه را پاک کنید، کل محتوای فایل **`worker.js`** این مخزن را جای‌گذاری کنید و دوباره روی **Deploy** کلیک کنید. (کلودفلر وابستگی `hono` را به‌طور خودکار بسته‌بندی می‌کند؛ اگر ویرایشگر خطای ماژول گم‌شده داد، بسته `hono` را از بخش **Packages** اضافه کنید و دوباره مستقر کنید.)

۳. **افزودن اتصال‌های لازم (Bindings)** — Worker را باز کنید، به **Settings ← Bindings** بروید و موارد زیر را اضافه کنید:
   - **فضای KV** — روی **Add binding → KV namespace** کلیک کنید، یک فضای جدید بسازید (هر نامی، مثلاً `bot-kv`) و آن را با نام متغیر **`BOT_KV`** متصل کنید، سپس Save کنید.
   - **Cron Trigger** — به **Triggers → Cron Triggers** بروید، یک تریگر با زمان‌بندی `*/15 * * * *` (هر ۱۵ دقیقه) اضافه کنید و Save کنید. *(Cron Triggers بخشی از پلن رایگان است؛ اگر حساب شما آن را ارائه نمی‌دهد، ربات همچنان به‌صورت درخواستی کار می‌کند — فقط بررسی‌های خودکار اجرا نمی‌شوند.)*
   - **توکن ربات** — در بخش **Variables**، متغیر `BOT_TOKEN` را با نوع **Encrypt** (مخفی) اضافه کنید، توکن خود را قرار دهید و **Save** را بزنید.
   - روی **Deploy** / **Redeploy** کلیک کنید تا اتصال‌ها اعمال شوند.

۴. **معرفی ربات به تلگرام** — این نشانی را در مرورگر باز کنید (به‌جای `<subdomain>` نشانی واقعی Worker خود را که در داشبورد نشان داده می‌شود قرار دهید):
   ```
   https://telegram-bot-reminder-bot.<subdomain>.workers.dev/register
   ```
   پاسخ `{"ok":true,...}` را می‌بینید. ✅ انجام شد — برای ربات پیام بفرستید.

### روش دوم — خط فرمان کلودفلر (Wrangler)

### 1. ساخت حساب کاربری Cloudflare

1. به آدرس <https://dash.cloudflare.com/sign-up> بروید.
2. با ایمیل ثبت‌نام کنید (یا با گوگل/اپل).
3. ایمیل خود را تأیید کنید.
4. برای استفاده از Workers روی پلن رایگان، نیازی به کارت اعتباری نیست.

### 2. نصب Wrangler

```bash
npm install -g wrangler
wrangler login
wrangler --version
```

### 3. ساخت ربات تلگرام

1. در تلگرام گفتگویی با [@BotFather](https://t.me/BotFather) شروع کنید.
2. دستور `/newbot` را بفرستید.
3. یک **نام** و یک **نام‌کاربری** که با `bot` تمام شود انتخاب کنید.
4. توکن دریافتی را محفوظ نگه دارید.

### 4. دریافت پروژه

```bash
git clone https://github.com/botlabz/telegram-bot-reminder-bot.git
cd telegram-bot-reminder-bot
npm install
```

### 5. تنظیم توکن ربات

```bash
wrangler secret put BOT_TOKEN
# paste your token when prompted
```

همچنین یک فضای KV بسازید و به wrangler.toml اضافه کنید:
```bash
wrangler kv namespace create BOT_KV
```


### 6. اجرای محلی و استقرار

```bash
wrangler dev        # local testing
wrangler deploy      # live at https://telegram-bot-reminder-bot.<subdomain>.workers.dev
```

### 7. اتصال webhook

باز کنید در مرورگر: / Open in browser:

```text
https://telegram-bot-reminder-bot.<your-subdomain>.workers.dev/register
```

✅ انجام شد! برای ربات پیام بفرستید.

---

## 💬 نحوه استفاده

| دستور | عملکرد |
| --- | --- |
| `/track` <name> <YYYY-MM-DD> | افزودن یادآوری |
| `/untrack` <n> | توقف پایش |
| `/list` | فهرست |
| `/check` | بررسی الان |
| `/help` | نمایش راهنما |

---

## 🗂 ساختار پروژه

```text
telegram-bot-reminder-bot/
├── worker.js      # کد کامل ربات (تک‌فایل)
├── wrangler.toml    # تنظیمات Cloudflare Workers
├── package.json
├── .gitignore
├── LICENSE          # MIT
├── README.md        # انگلیسی
└── README.fa.md     # فارسی
```

---

## 🔧 شخصی‌سازی

- دستورات، متن راهنما و پیام‌ها را در `worker.js` ویرایش کنید.
- برای بات‌های هوش‌مصنوعی، پrompt سیستم را در `CONFIG.system` تغییر دهید.
- برای بات‌های پایش، نوع و منابع را در `CONFIG` تنظیم کنید.

---

## 🆓 رایگان و متن‌باز

این پروژه تحت مجوز **MIT** منتشر شده است — برای استفاده شخصی و تجاری آزاد است.

---

## 🤖 ربات‌های تلگرام رایگان دیگر

بخشی از مجموعه ربات‌های تلگرام رایگان و متن‌باز توسط [botlabz](https://github.com/botlabz):

- [اصلاح‌کننده کد با هوش‌مصنوعی](https://github.com/botlabz/telegram-bot-ai-code-fixer)
- [تولیدکننده محتوا با هوش‌مصنوعی](https://github.com/botlabz/telegram-bot-ai-content-generator)
- [چت با سند هوش‌مصنوعی](https://github.com/botlabz/telegram-bot-ai-document-chat)
- [تحلیل‌گر فایل هوش‌مصنوعی](https://github.com/botlabz/telegram-bot-ai-file-analyzer)
- [پایش‌گر گیت‌هاب هوش‌مصنوعی](https://github.com/botlabz/telegram-bot-ai-github-tracker)
- [چکیده اخبار هوش‌مصنوعی](https://github.com/botlabz/telegram-bot-ai-news-digest)

همه ربات‌ها در سازمان [tele-bot](https://github.com/botlabz/tele-bot) موجودند.

---

بیایید با هم چیزی بسازیم 🚀

https://tally.so/r/q4q1L9
