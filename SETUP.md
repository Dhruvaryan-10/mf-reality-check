# Fund Reality: setup guide

The website for the mutual-funds project, built with **Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lenis smooth scrolling, ECharts and Supabase** (sign-in and the member database).

## 1. Run it on your computer

You need Node.js 18 or newer. From the project folder:

```
cd site
npm install
npm run dev
```

Open http://localhost:3000. `npm run dev` copies the analysis results from `../data/out` into the site automatically, so after you re-run `python analysis/4_calculate_metrics.py`, just restart it.

Everything except the member pages works straight away. Member pages (Dashboard, Compare) show setup steps until you do part 2.

## 2. Switch on sign-in (Supabase, free, about 5 minutes)

1. Go to https://supabase.com, sign up, and select **New project**. Pick any name and a database password (save it somewhere), region **Mumbai** if offered.
2. When it's ready, open **SQL Editor → New query**, paste everything from `site/supabase/schema.sql`, and select **Run**. This creates three tables (`watchlist`, `sip_plans`, `holdings`) with Row Level Security, so each user can only see their own rows.
3. Open **Project Settings → API** (or **Data API**). Copy the **Project URL** and the **anon public** key.
4. In the `site` folder, copy `.env.example` to a new file called `.env.local` and paste the two values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
   `.env.local` is in `.gitignore`, so it never goes to GitHub.
5. In Supabase, open **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:3000` (change it to your Vercel address once deployed)
   - **Redirect URLs:** add `http://localhost:3000/auth/callback` (and later `https://your-site.vercel.app/auth/callback`)
6. Restart `npm run dev`. Select **Sign in → Create account**. Supabase emails a confirmation link; open it and you land on your dashboard.

Tip for testing: in **Authentication → Providers → Email** you can turn off **Confirm email**, so new accounts sign in immediately.

### Optional: "Continue with Google"

In **Authentication → Providers → Google**, switch it on and paste a Google OAuth client ID and secret (made in Google Cloud Console → APIs & Services → Credentials, with `https://xxxx.supabase.co/auth/v1/callback` as the authorised redirect URI). Until then the Google button shows a friendly message and email sign-in still works.

## 3. Put it online (Vercel, free)

1. Push the whole `mf-reality-check` project to a GitHub repository.
2. On https://vercel.com select **Add New → Project**, import the repository and set **Root Directory** to `site`.
3. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as `.env.local`).
4. Select **Deploy**. Then add the Vercel address to Supabase's Site URL and Redirect URLs (step 2.5).

The build reads `../data/out`, so make sure `data/out` is committed (the root `.gitignore` already keeps it and skips the big raw files).

## 4. Make it yours

- `src/lib/site.ts`: your name and GitHub link (shown in the footer).
- `src/app/globals.css` and `tailwind.config.ts`: colours and fonts.

## How the site is organised

```
site/
├── src/app/                 one folder per page (Next.js App Router)
│   ├── page.tsx             landing: hero calculator, scroll story, chapters
│   ├── learn/               the seven ideas, sticky scroll visuals
│   ├── funds/               fund directory  +  funds/[slug] detail pages
│   ├── sip/                 SIP simulator
│   ├── insights/            timing, risk table, the catch, method
│   ├── compare/             members: compare up to 3 funds
│   ├── dashboard/           members: portfolio cost check, watchlist, saved SIPs
│   ├── login/               sign in / create account
│   └── auth/callback/       where Supabase sends people back after email/Google
├── src/components/
│   ├── motion/              reusable animation pieces (see below)
│   ├── charts/              ECharts wrapper, sparklines, small SVG charts
│   ├── home/ learn/ funds/ sip/ insights/ members/   page sections
│   └── site/                navbar, footer, buttons, page header
├── src/lib/                 data loading, maths (XIRR, SIP), formatting, Supabase clients
├── src/middleware.ts        keeps sessions fresh; sends signed-out visitors to /login
└── supabase/schema.sql      database tables + security policies
```

## Motion and where the ideas came from

All animation components were written for this project with Framer Motion. They're modelled on patterns from these libraries:

| Component | Where it's used | Pattern it's based on |
| --- | --- | --- |
| `ScrollStory` | landing: the chart draws as you scroll | Aceternity "Sticky Scroll Reveal" |
| `Odometer` | every big number rolls like a meter | 21st.dev number counter, Magic UI "Number Ticker" |
| `SplitText` | headlines rise word by word | React Bits "Split Text", Aceternity "Text Generate" |
| `ScrollTextReveal` | landing statement lights up with scroll | Magic UI "Text Reveal" |
| `MagicCard` | cards glow where the pointer is | Magic UI "Magic Card", Aceternity "Card Spotlight" |
| `Segmented` | tabs and toggles with a gliding pill | Aceternity "Animated Tabs" |
| `Navbar` | shrinks into a glass pill on scroll | Aceternity "Resizable Navbar" |
| `Marquee` | fund return ticker | Magic UI "Marquee" |
| `Spotlight` | soft light behind the hero | Aceternity "Spotlight", Magic UI "Light Rays" |
| `.border-beam` | light travelling round the hero card | Magic UI "Border Beam" |
| `Button variant="shimmer"` | main calls to action | Magic UI "Shimmer Button" |
| `Reveal` | sections fade and lift in | Magic UI "Blur Fade" |
| `template.tsx` | page transitions | Framer Motion |
| `SmoothScroll` | smooth scrolling | Lenis |

Everything respects the "reduce motion" accessibility setting: smooth scrolling turns off and movement becomes simple fades.
