# Select Security Training Academy

Next.js course storefront and protected video training platform for SSTA.

## Production Services

The code is wired for:

- Clerk authentication
- Stripe one-time course checkout
- Supabase student profiles, enrolments, and lesson progress
- Supabase enrollment leads with SMTP intake notifications
- Embedded YouTube or Google Drive lesson URLs

The app builds without live keys so it can be deployed first, then configured in
Vercel.

## Environment Variables

Copy `.env.example` to `.env.local` for local development and add the same keys
in Vercel Project Settings.

Required for full production behavior:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `SSTA_ADMIN_EMAILS`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `ENROLLMENT_TO_EMAIL`

## Supabase

Run the SQL migration in `supabase/migrations/202605200001_ssta_course_platform.sql`
against the SSTA Supabase project. It creates:

- `student_profiles`
- `courses`
- `course_lessons`
- `course_enrollments`
- `enrollment_leads`
- `lesson_progress`

It also enables RLS and seeds the first set of courses and lessons.

`enrollment_leads` intentionally has no public or authenticated RLS policy.
Enrollment intake writes happen only through the Next.js server route with the
Supabase service role key.

## Stripe

Create a webhook endpoint pointing to:

```txt
https://YOUR_DOMAIN/api/stripe/webhook
```

Listen for:

```txt
checkout.session.completed
checkout.session.expired
```

The enrollment form stores a lead in Supabase, emails the configured intake
mailbox, then redirects to Stripe. The webhook marks the enrollment paid and
grants course access in Supabase after a successful one-time payment.

Payments are intentionally 503-safe until `STRIPE_SECRET_KEY` and
`STRIPE_WEBHOOK_SECRET` are configured.

## Vercel Domain Setup

Use the existing Vercel project `ssta`
(`prj_FCpx8ApyXLF0SlSfvoD7q26Mmzj2`) and add both production domains:

```txt
ssta.net.au
www.ssta.net.au
```

Preserve cPanel email before changing website records:

```txt
A      mail   104.168.149.99
MX     @      mail.ssta.net.au
TXT    @      include or keep ip4:104.168.149.99 in SPF
```

Then point website traffic to Vercel:

```txt
A      @      76.76.21.21
CNAME  www    cname.vercel-dns-0.com
```

Add the SMTP mailbox password only as an encrypted Vercel environment variable.
Do not commit real passwords or API keys.

## Development

```bash
npm install
npm run dev
```

Checks:

```bash
npm run lint
npm run build
```
