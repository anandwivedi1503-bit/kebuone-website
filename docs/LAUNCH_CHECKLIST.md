# Evuddy launch checklist (website backend + EC2)

The rider app calls **`https://www.evuddy.com/api/*`** only. After merging this branch, deploy **`main`** to EC2.

## 1. GitHub Actions secrets (fixes stale `unpaidSweep` on `/api/health`)

Repository **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|--------|
| `CRON_SECRET` | Long random string (same on EC2) |
| `SITE_URL` | `https://www.evuddy.com` (optional; defaults to this) |

Workflow **Release unpaid holds** runs every 10 minutes and `POST`s `/api/jobs/release-unpaid`.

On **EC2**, set environment variable **`CRON_SECRET`** to the same value as GitHub.

Verify: `GET https://www.evuddy.com/api/health` → `unpaidJob.stale` should be `false` within ~15 minutes.

## 2. EC2 deploy

```bash
git pull origin main
npm ci
npm run build
# restart your process (pm2/systemd/docker — your existing command)
```

## 3. Smoke tests

- `GET /api/health` — `success`, `database`, fresh `unpaidJob`
- Website Book EV — login, create booking, Razorpay (test mode if applicable)
- App on phone — same rider, cities/hubs, pay, pickup OTP SMS
- Admin CRM — rider safety board shows GPS during active ride

## 4. Firebase (not in this repo)

Android app **`com.evuddy.app`** on Firebase project **`kebuone-otp`**: upload keystore SHA-1 + Play App signing SHA-1.

## 5. Branding

Rider-facing copy uses **Evuddy**. MSG91 sender ID stays **`EVUDDY`** unless you change it with the SMS provider.
