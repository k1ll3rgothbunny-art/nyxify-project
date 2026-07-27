# Getting Nyxify Live — Click-by-Click Guide

Follow this top to bottom, in order. Don't skip ahead — later steps need
values (IDs, keys, tokens) you copy from earlier ones. There's a running
checklist at the bottom you can copy into Notes as you go.

Nothing in this guide uses a terminal. Everything is clicking buttons on
websites.

---

## Part 1: Get the code onto GitHub

1. Go to **github.com** and click **Sign up** (top right). Make a free account.
2. Once logged in, click the **+** icon in the top-right corner → **New repository**.
3. Under "Repository name," type `nyxify`.
4. Leave everything else as-is. Click the green **Create repository** button.
5. On the next page, look for a link that says **"uploading an existing file"** — click it.
   (If you don't see it, look for an **Add file** button near the top right → **Upload files**.)
6. Open the `nyxify` folder you unzipped earlier on your computer.
7. Select **everything inside it** (not the outer folder — the `src`, `prisma` folders,
   `package.json`, `README.md`, etc. themselves) and drag them into the browser window.
8. Wait for the upload bar to finish.
9. Scroll to the bottom, click the green **Commit changes** button.

✅ Your code is now on GitHub.

---

## Part 2: Create your free database

1. Go to **neon.tech** and click **Sign up**. You can sign up with your GitHub account
   to skip making a new password.
2. After signing up, it should prompt you to create a project. If not, click **New Project**.
3. Name it whatever you want (e.g. "nyxify"). Leave the rest default. Click **Create Project**.
4. You'll land on a page with a box labeled **Connection string**. Click the **copy icon** next to it.
5. Paste it somewhere temporary (a Notes app) — label it `DATABASE_URL`. You'll need it in Part 7.

✅ Your database exists (it's empty — that's fine, it fills itself in automatically later).

---

## Part 3: Create your Discord app (login + bot)

1. Go to **discord.com/developers/applications**. Log in with your normal Discord account.
2. Click the blue **New Application** button (top right).
3. Give it a name like "Nyxify" and click **Create**.
4. You're now on the **General Information** page. Along the left sidebar, click **OAuth2**.
5. Under "Client information," you'll see **Client ID** — click **Copy**, save it as `DISCORD_CLIENT_ID`.
6. Just below it, click **Reset Secret** (or it may already show a **Client Secret** — click **Copy**),
   save it as `DISCORD_CLIENT_SECRET`.
7. Still on the OAuth2 page, find **Redirects**. Click **Add Redirect**.
   - For now, type: `http://localhost:3000/api/auth/callback/discord`
   - (You'll add a second one for your live site in Part 7 — don't worry about that yet.)
   - Click **Save Changes** at the bottom.
8. In the left sidebar, click **Bot**.
9. Click **Reset Token** → confirm → **Copy** the token. Save it as `DISCORD_BOT_TOKEN`.
   ⚠️ This is shown only once — if you lose it, you'll have to reset it again.
10. On the same page, scroll down to **Privileged Gateway Intents** and turn ON
    **Server Members Intent**. Click **Save Changes**.

✅ You now have `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `DISCORD_BOT_TOKEN` saved.

### 3b. Invite the bot to your Discord server

1. Still in the Developer Portal, left sidebar → **OAuth2** → scroll down to **URL Generator**.
2. Under **Scopes**, check the box next to **bot**.
3. A new box appears below called **Bot Permissions** — check:
   **Manage Channels**, **Send Messages**, **Embed Links**.
4. Scroll down, copy the **Generated URL** at the bottom.
5. Paste that URL into a new browser tab, press Enter.
6. Pick your Discord server from the dropdown, click **Continue**, then **Authorize**.

✅ The bot now appears in your server's member list (it'll show offline — that's expected,
it doesn't need to be "online" the way a normal bot does).

### 3c. Get your server, category, channel, and role IDs

First, turn on ID copying: in Discord (the app, not the browser) →
**User Settings (gear icon)** → **Advanced** → turn on **Developer Mode**.

1. Right-click your server's icon (top left of Discord) → **Copy Server ID**.
   Save as `DISCORD_GUILD_ID`.
2. Create a channel category for tickets: right-click empty space in your channel list →
   **Create Category** → name it "Orders" → right-click it → **Copy Category ID**.
   Save as `DISCORD_TICKET_CATEGORY_ID`.
3. Create a text channel called `portfolio` (right-click a category → Create Channel).
   Right-click the new channel → **Copy Channel ID**. Save as `DISCORD_PORTFOLIO_CHANNEL_ID`.
4. Right-click your staff role in **Server Settings → Roles** (or wherever you manage roles) →
   **Copy Role ID**. Save as `DISCORD_STAFF_ROLE_ID`. (If you don't have a staff role yet,
   create one first: Server Settings → Roles → Create Role.)

✅ You now have all six Discord values.

---

## Part 4: Create your PayPal app

1. Go to **developer.paypal.com**, click **Log in** (use your normal PayPal account, or
   create one first at paypal.com if you don't have one — it's free).
2. Once logged in, click **Apps & Credentials** in the top menu.
3. Make sure the **Sandbox** toggle is selected (not Live) — we'll switch this later.
4. Click **Create App**.
5. Name it "Nyxify", leave the app type as default, click **Create App**.
6. You'll see **Client ID** — click to copy it, save as both `PAYPAL_CLIENT_ID` AND
   `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (same value, two places).
7. Click **Show** next to **Secret**, copy it, save as `PAYPAL_CLIENT_SECRET`.

✅ You now have your PayPal sandbox credentials (fake-money mode, for testing).

---

## Part 5: Create your Square app (for Cash App Pay)

1. Go to **squareup.com/signup** and create a free Square account if you don't have one.
2. Then go to **developer.squareup.com/apps**, log in with that Square account.
3. Click **+ Create your first application** (or **+ Create App**).
4. Name it "Nyxify", click **Create**.
5. You'll land on your app's dashboard. Make sure you're on the **Sandbox** tab (toggle near the top).
6. Copy the **Sandbox Application ID** → save as `NEXT_PUBLIC_SQUARE_APPLICATION_ID`.
7. Copy the **Sandbox Access Token** → save as `SQUARE_ACCESS_TOKEN`.
8. Scroll down (or click **Locations** in the sidebar) to find **Location ID** →
   copy it → save as both `SQUARE_LOCATION_ID` and `NEXT_PUBLIC_SQUARE_LOCATION_ID`.

✅ You now have your Square (Cash App Pay) sandbox credentials.

---

## Part 6: Create your file storage (Cloudflare R2)

1. Go to **dash.cloudflare.com**, sign up for a free account.
2. In the left sidebar, find **R2 Object Storage** (you may need to click **R2** under
   the main menu). Click it.
3. Click **Create bucket**. Name it `nyxify-vault`. Leave defaults. Click **Create bucket**.
4. Back on the R2 overview page, look for **Manage R2 API Tokens** (usually a button on the
   right side, or under account settings).
5. Click **Create API Token**.
6. Give it a name, set permissions to **Object Read & Write**, click **Create API Token**.
7. You'll see three values on screen — copy each one now, they won't be shown again:
   - **Access Key ID** → save as `S3_ACCESS_KEY_ID`
   - **Secret Access Key** → save as `S3_SECRET_ACCESS_KEY`
   - **Endpoint / Jurisdiction-specific endpoint** (a URL ending in `.r2.cloudflarestorage.com`)
     → save as `S3_ENDPOINT`

✅ You now have your storage credentials.

---

## Part 7: Put it all together on Vercel

1. Go to **vercel.com**, click **Sign Up**, choose **Continue with GitHub** (use the same
   GitHub account from Part 1).
2. Click **Add New...** → **Project**.
3. Find your `nyxify` repo in the list, click **Import**.
4. Before clicking Deploy, click to expand **Environment Variables**.
5. Now you'll add each value you saved above, one at a time. For each one: type the name
   on the left (exactly as shown, all capitals) and paste the value on the right, then
   click **Add**. Here's the full list to add:

   ```
   NEXTAUTH_URL                        → (leave blank for now, see step 8 below)
   NEXTAUTH_SECRET                     → any random long string, e.g. mash your keyboard 40 characters
   DATABASE_URL                        → from Part 2
   DISCORD_CLIENT_ID                   → from Part 3
   DISCORD_CLIENT_SECRET               → from Part 3
   DISCORD_BOT_TOKEN                   → from Part 3
   DISCORD_GUILD_ID                    → from Part 3c
   DISCORD_TICKET_CATEGORY_ID          → from Part 3c
   DISCORD_PORTFOLIO_CHANNEL_ID        → from Part 3c
   DISCORD_STAFF_ROLE_ID               → from Part 3c
   PAYPAL_CLIENT_ID                    → from Part 4
   PAYPAL_CLIENT_SECRET                → from Part 4
   PAYPAL_ENV                          → sandbox
   NEXT_PUBLIC_PAYPAL_CLIENT_ID        → from Part 4 (same as PAYPAL_CLIENT_ID)
   SQUARE_ACCESS_TOKEN                 → from Part 5
   SQUARE_LOCATION_ID                  → from Part 5
   SQUARE_ENV                          → sandbox
   NEXT_PUBLIC_SQUARE_APPLICATION_ID   → from Part 5
   NEXT_PUBLIC_SQUARE_LOCATION_ID      → from Part 5
   NEXT_PUBLIC_SQUARE_ENV              → sandbox
   S3_ENDPOINT                         → from Part 6
   S3_REGION                           → auto
   S3_BUCKET                           → nyxify-vault
   S3_ACCESS_KEY_ID                    → from Part 6
   S3_SECRET_ACCESS_KEY                → from Part 6
   ```

6. Click the blue **Deploy** button. This takes a few minutes — you'll see a build log
   scrolling by. Grab a drink.
7. When it finishes, you'll see a **Congratulations** screen with a link to your live
   site (something like `nyxify-yourname.vercel.app`). Click it to see your site — it's live!
8. **Now go back and fix `NEXTAUTH_URL`**: copy that live URL (with `https://` in front),
   go to your Vercel project → **Settings** → **Environment Variables**, find `NEXTAUTH_URL`,
   edit it, paste your real URL in (e.g. `https://nyxify-yourname.vercel.app`), save.
9. Go to **Deployments** tab → click the **...** menu on the latest deployment → **Redeploy**,
   so the site picks up that change.
10. Last step: go back to **Discord Developer Portal** → your app → **OAuth2** → **Redirects** →
    **Add Redirect** → paste `https://your-real-url.vercel.app/api/auth/callback/discord`
    (using your actual URL) → **Save Changes**.

✅ Your site is live and Discord login will work on it.

---

## Part 8: Make yourself an admin

1. Go to your live site, log in once with **Log in with Discord**.
2. Go back to **neon.tech**, open your project, click **Tables** (or **SQL Editor**) in the sidebar.
3. Find the `User` table — you should see one row (you).
4. Edit that row's `role` column, changing it from `CUSTOMER` to `ADMIN`. Save.
5. Refresh your live site and go to `/admin` on your domain (e.g. `nyxify-yourname.vercel.app/admin`).

✅ You now have access to the admin dashboard.

---

## When you're ready for real money (not sandbox)

Both PayPal and Square start in test mode with fake money so you can try everything safely.
When ready:
- **PayPal**: developer.paypal.com → Apps & Credentials → toggle to **Live** → create/copy those
  credentials → update `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`,
  and set `PAYPAL_ENV` to `live` in Vercel's Environment Variables, then redeploy.
- **Square**: developer.squareup.com → your app → toggle to **Production** (Square will ask you
  to verify your business first) → copy the Production values → update `SQUARE_ACCESS_TOKEN`,
  `SQUARE_LOCATION_ID`, `NEXT_PUBLIC_SQUARE_APPLICATION_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID`,
  and set `SQUARE_ENV` / `NEXT_PUBLIC_SQUARE_ENV` to `production`, then redeploy.

---

## Checklist of every value you need

Copy this into a Notes app and fill it in as you go:

```
DATABASE_URL =
DISCORD_CLIENT_ID =
DISCORD_CLIENT_SECRET =
DISCORD_BOT_TOKEN =
DISCORD_GUILD_ID =
DISCORD_TICKET_CATEGORY_ID =
DISCORD_PORTFOLIO_CHANNEL_ID =
DISCORD_STAFF_ROLE_ID =
PAYPAL_CLIENT_ID =
PAYPAL_CLIENT_SECRET =
SQUARE_ACCESS_TOKEN =
SQUARE_LOCATION_ID =
NEXT_PUBLIC_SQUARE_APPLICATION_ID =
S3_ENDPOINT =
S3_ACCESS_KEY_ID =
S3_SECRET_ACCESS_KEY =
```

Stuck on any step? Tell me exactly which part and what you're seeing on screen, and I'll help from there.
