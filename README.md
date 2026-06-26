# Select Security Training Academy

Next.js course storefront and protected video training platform for SSTA.

## Production Services

The code is wired for:

- Supabase Auth with Google OAuth and email/password sign-in
- Custom `/sign-in` and `/sign-up` pages styled for the SSTA admin portal
- Admin access controlled by `SSTA_ADMIN_EMAILS`
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

Run `supabase/migrations/202606250001_ssta_admin_portal_excel.sql` after the
base migration to enable the admin portal fields, course units, manual student
profile fields, and Excel-backed import/export workflows.

Run `supabase/migrations/202606260001_ssta_supabase_auth_cutover.sql` after the
admin portal migration to rename identity columns from `clerk_user_id` to
`user_key`, align RLS with Supabase Auth sessions, and complete the auth
cutover.

`enrollment_leads` intentionally has no public or authenticated RLS policy.
Enrollment intake writes happen only through the Next.js server route with the
Supabase service role key. The table also records `email_status`,
`email_error`, and `email_sent_at` so SMTP notification delivery can be audited
without exposing intake data publicly.

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
`STRIPE_WEBHOOK_SECRET` are configured. Checkout also refuses payment until
Supabase Auth is configured, because course access is granted to the signed-in
student after Stripe confirms payment.

## Supabase Auth Setup

1. In Google Cloud Console, configure the OAuth consent screen for the chosen
   project and create a Web OAuth client.
2. Add JavaScript origins:
   - `https://ssta.net.au`
   - `https://www.ssta.net.au`
   - `http://localhost:3000`
3. Add the Google redirect URI shown in Supabase at
   `Authentication > Providers > Google`.
4. In Supabase Auth:
   - enable Google
   - enable email/password
   - set Site URL to `https://ssta.net.au`
   - add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://ssta.net.au/auth/callback`
     - `https://www.ssta.net.au/auth/callback`
5. Admin access is granted only when the signed-in user email is listed in
   `SSTA_ADMIN_EMAILS`.

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
npm run verify:supabase-admin
```
