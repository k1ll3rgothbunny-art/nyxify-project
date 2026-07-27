# Nyxify

👉 **New to this / not a developer?** Open **`GETTING-STARTED.md`** instead — it's a
click-by-click guide with no assumed knowledge. This file below is the more
technical reference.

A full custom ordering platform: Discord login, order pipeline, PayPal and Cash App Pay
payments, a private per-customer Vault, portfolio with Discord auto-posting,
admin dashboard, notifications, and reviews — built as a single Next.js app.

## The whole thing runs as one app, on free tiers

Discord actions (opening ticket channels, posting showcases, DMing customers)
are all one-off REST calls, not something that needs a live bot connection —
so they happen right inside the Next.js API routes (`src/lib/discord-bridge.ts`)
using your bot token as a server-only secret. There's no second server to
run or pay for.

That means you can host the **entire thing for $0**, at least while you're small:

| Piece | Free option | Notes |
|---|---|---|
| Web app | **Vercel** (Hobby plan) | Deploys straight from GitHub, free for personal/small-business use |
| Database | **Neon** or **Supabase** | Both have a genuinely free Postgres tier, no card required to start |
| File storage (Vault) | **Cloudflare R2** or **Supabase Storage** | R2 gives 10GB free storage and, importantly, **no egress fees** — most "free" storage still charges per download, R2 doesn't. Supabase Storage's free tier (1GB) is simplest if you're already using Supabase for the database, since it's one account. |
| Discord bot | *(nothing — see above)* | Runs inside the same Vercel deployment |

You'll only start paying if you outgrow these limits (R2: 10GB storage, Neon: ~0.5GB DB,
Vercel Hobby: generous but not unlimited bandwidth) — which, for a one-person custom
order shop, is a while off.

## Project layout

```
nyxify/
├── prisma/schema.prisma     # full data model: users, orders, payments, vault, showcases, reviews
├── src/app/                 # pages + API routes (Next.js App Router)
│   ├── page.tsx             # homepage
│   ├── order/                order request form
│   ├── dashboard/             customer dashboard + /vault
│   ├── portfolio/              showcase list + detail w/ "Order Something Similar"
│   ├── admin/                  admin dashboard, orders, showcases, analytics
│   └── api/                    orders, checkout, stripe webhook, vault downloads, discord ticket, admin routes
├── src/components/          # UI components
└── src/lib/                 # prisma client, auth config, stripe, s3, discord-bridge (Discord REST calls)
```

## 1. Set up your free accounts

1. **Neon** (neon.tech) or **Supabase** (supabase.com) → create a Postgres project → copy the connection string.
2. **Cloudflare R2** (dash.cloudflare.com → R2) → create a bucket → create an API token
   (this is where `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` come from).
   If you'd rather use one account for everything, Supabase Storage works too — its
   S3-compatible endpoint is in Project Settings → Storage.
3. **Discord Developer Portal** (discord.com/developers/applications) → New Application →
   - OAuth2 tab: add redirect URL, copy Client ID/Secret
   - Bot tab: Add Bot, copy the token, enable "Server Members Intent"
4. **PayPal Developer** (developer.paypal.com) → Log in → Apps & Credentials → create an app →
   copy the Client ID and Secret (use the Sandbox ones while testing).
5. **Square** (squareup.com/signup, then developer.squareup.com/apps) → Square is who actually
   processes Cash App Pay under the hood — you don't need a separate Cash App business account.
   Create an app, copy the Application ID, Access Token, and Location ID from the Sandbox tab
   while testing. All free to set up; both PayPal and Square only take a cut per transaction,
   there's no monthly fee for either.

## 2. Local development

```bash
npm install
cp .env.example .env      # fill in the values from step 1
npx prisma db push        # creates tables in your Neon/Supabase database
npm run dev                # localhost:3000
```

## 3. Discord server setup

- In your server: create a channel category for tickets → copy its ID → `DISCORD_TICKET_CATEGORY_ID`
- Create a "Portfolio" channel → `DISCORD_PORTFOLIO_CHANNEL_ID`
- Invite your bot to the server with `Manage Channels`, `Send Messages`, `Embed Links` permissions
  (Discord Developer Portal → OAuth2 → URL Generator, check `bot` + those permissions, open the generated link)
- Your staff role, so staff can see ticket channels → `DISCORD_STAFF_ROLE_ID`
- (Enable Developer Mode in Discord's settings to right-click and "Copy ID" on any of these.)

## 4. Deploying to Vercel (free)

1. Push this project to a GitHub repo.
2. On vercel.com → New Project → import the repo.
3. Add every variable from `.env.example` in Vercel's Environment Variables settings,
   with real values — set `NEXTAUTH_URL` to your Vercel domain.
4. Deploy. Update your Discord OAuth redirect URL and Stripe webhook URL to point at
   the live domain instead of localhost.

## 5. Going live with real payments

Both PayPal and Square start you in **sandbox mode** — fake money, safe for testing the whole
flow. When you're ready to accept real payments:

- **PayPal**: in your app's dashboard, switch from Sandbox to Live credentials, update
  `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, and set `PAYPAL_ENV=live`.
- **Square/Cash App Pay**: same idea — switch to your Production Application ID, Access Token,
  and Location ID in the Square dashboard, and set `SQUARE_ENV=production` (and the matching
  `NEXT_PUBLIC_SQUARE_ENV=production`). Square requires you to complete their business verification
  before Production credentials will actually process real charges.

## 6. Making yourself an admin

There's no signup flow for admins on purpose — log in once with Discord, then open
your database's dashboard (Neon/Supabase both have a table editor, or run
`npx prisma studio` locally against the same `DATABASE_URL`) and set your `User.role` to `ADMIN`.

## 7. What's stubbed or needs finishing

- **File upload flow** — the order form and admin delivery both request signed upload
  URLs from storage; wiring the actual `PUT` of file bytes from the browser is a
  ~20 line addition once your bucket's CORS settings are configured (R2 and Supabase
  both have a one-screen CORS setup in their dashboards).
- **Coupon/gift card admin UI** — the `Coupon` model and checkout discount logic exist;
  there's no admin screen to create them yet (add rows via your DB's table editor for now).
- **Email notifications** — Discord notifications are fully wired; email wasn't required
  by the spec. Resend has a free tier if you want to add it later.
- **"Future Features" list** (loyalty, referrals, VIP tiers, gift cards, affiliate program,
  blog, appointment booking, marketplace) — intentionally left out to keep the core
  system simple, per the original brief. The schema (e.g. `vipTier` on `User`) leaves room.
