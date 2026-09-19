# Mates

A Splitwise-style app for tracking shared expenses with friends, roommates and trips. Create groups, log who paid for what, split it however you like, and see exactly who owes whom, then settle up.

Built with Next.js (App Router), Clerk, Neon Postgres and Drizzle, and deployed on Vercel.

## Features

- **Groups** with admin/member roles, and invites by email. Pending invites are resolved automatically when the invitee signs up.
- **Expenses** with four split types:
  - **Equal**: remainder cents are distributed so the split always sums exactly to the total
  - **Exact**: enter each person's amount
  - **Percentage**: shares are floored, and leftover cents go to the largest fractional remainders
  - **Line item**: assign individual items to individual people
- **Balances**: per-group balances, a cross-group Friends view, and a dashboard summary of what you owe and are owed.
- **Settlements**: record payments between members to settle up.
- **Recurring expenses**: weekly or monthly schedules, turned into real expenses by a daily cron job.
- **Comments** on expenses.
- **Activity feed** across your groups.
- **Multi-currency**: USD, INR and GBP, with locale-aware formatting. Amounts are stored as integer cents.
- **Light/dark theme**, responsive layout.

### Work in progress

- **Receipt scanning** is a simulated demo. The upload screen currently loads a sample receipt to show the review flow (merchant, total, line items, confidence). Real image upload and OCR are not wired up yet.
- Some form components still import placeholder data from `lib/mock-data.ts`.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| Auth | [Clerk](https://clerk.com), with a webhook that syncs users into the database |
| Database | [Neon](https://neon.com) Postgres via `@neondatabase/serverless` |
| ORM | [Drizzle ORM](https://orm.drizzle.team) + drizzle-kit |
| UI | Tailwind CSS v4, shadcn/ui on Base UI, lucide-react, sonner, next-themes |
| Validation | [Zod](https://zod.dev) |
| Hosting | [Vercel](https://vercel.com) (including Vercel Cron) |

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- A [Clerk](https://clerk.com) application
- A [Neon](https://neon.com) Postgres database (or the Neon integration from the Vercel Marketplace)

### 1. Install

```bash
git clone https://github.com/Jaswanth9649/mates.git
cd mates
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Database (Neon connection string)
STORAGE_DATABASE_DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Protects the recurring-expenses cron endpoint (any long random string)
CRON_SECRET=change-me
```

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk authentication |
| `CLERK_WEBHOOK_SECRET` | Verifying Clerk webhook signatures (Svix) |
| `NEXT_PUBLIC_CLERK_*_URL` | Sign-in/sign-up routes and post-auth redirects |
| `STORAGE_DATABASE_DATABASE_URL` | Postgres connection for the app and drizzle-kit. The name comes from the Vercel Neon integration's `STORAGE_DATABASE` prefix. |
| `CRON_SECRET` | Bearer token the cron route requires |

> `.env*` files are gitignored. Never commit real keys.

### 3. Set up the database

Push the Drizzle schema to your database:

```bash
npm run db:push
```

### 4. Set up the Clerk webhook

The app keeps its own `users` table in sync with Clerk (and resolves pending group invites when someone signs up).

1. In the Clerk dashboard, go to **Webhooks** and add an endpoint: `https://<your-domain>/api/webhooks/clerk`
2. Subscribe to the `user.created` and `user.updated` events (the only ones the handler processes).
3. Copy the signing secret into `CLERK_WEBHOOK_SECRET`.

For local development, expose your dev server with a tunnel (for example ngrok or the Vercel CLI) and point the webhook at it.

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |
| `npm test` | Run unit tests (split calculations, recurring schedule logic) using the Node test runner |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push the schema straight to the database |
| `npm run db:studio` | Open Drizzle Studio |

## Project structure

```
app/
  (app)/                 Authenticated app: dashboard, groups, friends
    groups/[groupId]/    Expenses, members, settle up, receipts, recurring
  api/                   Route handlers: expenses, groups, settlements,
                         recurring, comments, Clerk webhook, cron
  sign-in/, sign-up/     Clerk auth pages
components/              UI grouped by feature (expenses, groups, balances, ...)
lib/
  db/                    Drizzle schema, client and query modules
  splits/                Equal / exact / percentage split calculators (+ tests)
  recurring/             Next-run scheduling logic (+ tests)
  validation/            Zod schemas for API input
  auth/                  Current-user and authorization helpers
proxy.ts                 Clerk middleware
vercel.json              Cron schedule
```

## Deploying to Vercel

1. Import the repo into Vercel.
2. Add the environment variables from step 2 to the project. If you use the Neon integration from the Vercel Marketplace, the `STORAGE_DATABASE_*` variables are added for you.
3. Run `npm run db:push` once against the production database.
4. Add the production URL to your Clerk webhook endpoint (step 4).

`vercel.json` registers a daily cron (`0 6 * * *` UTC) that calls `/api/cron/recurring`. Vercel sends `Authorization: Bearer $CRON_SECRET` with each cron request, and the route rejects anything else. That is why `CRON_SECRET` must be set in the Vercel project.

## How money is handled

All amounts are stored as **integer cents** to avoid floating-point errors. Split calculators always distribute remainders deterministically so the parts sum exactly to the total. Balances are computed per currency, so amounts in different currencies are never mixed.

## License

No license has been specified yet. Add a `LICENSE` file to state how others may use this code.
