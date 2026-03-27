## ReadMyVibe

Mobile-first micro-payment curiosity platform with 7 AI tools, Gemini generation, Razorpay unlock flow, and Supabase tracking.

### Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

### Required env vars

- `GEMINI_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Supabase schema

Run `supabase-schema.sql` in Supabase SQL Editor.

### Core routes

- Home: `/`
- Tool pages: `/tools/[toolId]`
- Generate API: `POST /api/generate`
- Create order API: `POST /api/payment/create-order`
- Verify payment API: `POST /api/payment/verify`
- Unlock check API: `GET /api/unlock?sessionId=...&toolId=...`

### Build check

```bash
npm run lint
npm run build
```

### Deploy

1. Push to GitHub
2. Import project into Vercel
3. Add env vars in Vercel
4. Configure Razorpay webhook to `/api/payment/verify`
