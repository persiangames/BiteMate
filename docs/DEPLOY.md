# BiteMate — Production deployment (bitemate.ir)

This guide covers Google sign-in, SMS, email, and hosting settings for **www.bitemate.ir**.

---

## 1. Google / Firebase (ورود با گوگل)

### Step A — Create Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/)
2. **Add project** → name it e.g. `bitemate`
3. Disable Google Analytics if you do not need it (optional)

### Step B — Enable Google sign-in

1. In Firebase: **Build → Authentication → Sign-in method**
2. Enable **Google**
3. Set support email and save

### Step C — Register your web app

1. Project overview → **Add app → Web** (`</>`)
2. App nickname: `BiteMate Web`
3. Copy the config values into `apps/web/.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

### Step D — Authorized domains

1. **Authentication → Settings → Authorized domains**
2. Add:
   - `localhost` (development)
   - `bitemate.ir`
   - `www.bitemate.ir`

### Step E — Server-side (API) Firebase Admin

1. **Project settings → Service accounts → Generate new private key**
2. Put values in `apps/api/.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> Keep the private key secret. Never commit `.env` to git.

### Optional — Google Cloud OAuth (if you use OAuth client directly)

1. [Google Cloud Console](https://console.cloud.google.com/) → same project as Firebase
2. **APIs & Services → Credentials → Create OAuth client ID**
3. Type: **Web application**
4. Authorized JavaScript origins:
   - `https://www.bitemate.ir`
   - `https://bitemate.ir`
   - `http://localhost:5173`
5. Authorized redirect URIs (Firebase handles most flows):
   - `https://your-project.firebaseapp.com/__/auth/handler`

For BiteMate, **Firebase Web SDK + Admin SDK** is enough; you do not need a separate OAuth client unless you add custom flows.

---

## 2. SMS (پیامک — ایران)

The API supports these providers via `SMS_PROVIDER`:

| Provider | Env value | Notes |
|----------|-----------|--------|
| Dev / test | `console` | Logs OTP in server console |
| Kavenegar | `kavenegar` | Popular in Iran; OTP template support |
| Melipayamak | `melipayamak` | Payamak Panel REST API |
| Custom HTTP | `http` | Your operator’s REST endpoint |

### Kavenegar (recommended)

1. Register at [kavenegar.com](https://panel.kavenegar.com/)
2. Buy SMS credit and register sender line (خط خدماتی)
3. Create OTP **Lookup template** in panel
4. Set in `apps/api/.env`:

```env
SMS_PROVIDER=kavenegar
SMS_SENDER=1000XXXX
KAVENEGAR_API_KEY=your-api-key
KAVENEGAR_OTP_TEMPLATE=your-template-name
```

### Melipayamak

1. Register at [melipayamak.com](https://melipayamak.com/)
2. Get username, password, and sender number
3. Set:

```env
SMS_PROVIDER=melipayamak
MELIPAYAMAK_USERNAME=
MELIPAYAMAK_PASSWORD=
MELIPAYAMAK_FROM=5000...
```

### Domain note

SMS content usually shows your **sender line**, not `bitemate.ir`. Use `APP_PUBLIC_URL=https://www.bitemate.ir` so email links point to your domain.

---

## 3. Email (ایمیل)

### Render free tier — SMTP is blocked

Render **blocks outbound SMTP** (ports 25, 465, 587) on **free** web services. Gmail SMTP will show `Connection timeout` even with correct credentials. Options:

1. **Resend (recommended on Render free)** — HTTPS API, works on free tier
2. **Upgrade Render API** to a paid instance — then Gmail SMTP can work
3. **Mail hosting on bitemate.ir** — use SMTP from a provider that allows it, or Resend with your domain

Development: keep `EMAIL_PROVIDER=console` — OTP codes appear in API logs and `devCode` in API responses.

### Resend (production on Render free)

1. Sign up at [resend.com](https://resend.com/)
2. **API Keys** → create key → copy `re_...`
3. **Domains** → add `bitemate.ir` → add the DNS records Resend shows in Cloudflare (SPF + DKIM)
4. On Render (`bitemate-api` environment):

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=noreply@bitemate.ir
EMAIL_FROM_NAME=BiteMate
```

Until the domain is verified, Resend may only allow test sends from `onboarding@resend.dev` to your signup email — verify `bitemate.ir` for production.

### SMTP (local dev or paid hosting)

```env
EMAIL_PROVIDER=smtp
EMAIL_FROM=noreply@bitemate.ir
EMAIL_FROM_NAME=BiteMate
SMTP_HOST=mail.bitemate.ir
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@bitemate.ir
SMTP_PASS=your-mailbox-password
```

Create `noreply@bitemate.ir` in your mail panel and enable SPF/DKIM for deliverability.

---

## 4. Production API environment

```env
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://www.bitemate.ir,https://bitemate.ir
APP_PUBLIC_URL=https://www.bitemate.ir
MEDIA_PUBLIC_BASE_URL=https://www.bitemate.ir/uploads
JWT_SECRET=generate-a-long-random-secret-min-32-chars
TRUST_PROXY=true
```

Build web with:

```env
VITE_API_BASE_URL=https://www.bitemate.ir/api
```

---

## 5. Hosting checklist (هاست bitemate.ir)

- [ ] SSL certificate for `www.bitemate.ir` and `bitemate.ir`
- [ ] Reverse proxy (Nginx/Caddy): `/api` → NestJS, `/` → static web build
- [ ] PostgreSQL, Redis, MongoDB reachable from API
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Set all `.env` values (Firebase, SMS, SMTP, JWT, DB)
- [ ] Test: register → OTP, login → Google, forgot password → reset

---

## 6. OTP flows in BiteMate

| Flow | Endpoint | Delivery |
|------|----------|----------|
| After register | Auto on `POST /auth/register` | SMS or email |
| Verify account | `POST /auth/otp/verify` (logged in) | — |
| Login with code | `POST /auth/otp/login/request` + `verify` | SMS or email |
| Forgot password | `POST /auth/password/forgot` + `reset` | SMS or email |

In **development**, OTP codes are returned as `devCode` in API responses and logged when `SMS_PROVIDER=console` / `EMAIL_PROVIDER=console`.
