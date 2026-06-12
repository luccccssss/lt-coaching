# LT Coaching — Deploy Guide

## Step 1 — Supabase (database + auth)

1. Go to https://supabase.com and create a free account
2. Click **New project**, name it `lt-coaching`, pick a region close to Australia
3. Wait for it to spin up (~2 min)
4. Go to **SQL Editor** → paste the entire contents of `supabase-schema.sql` → click Run
5. Go to **Project Settings → API**
6. Copy your **Project URL** and **anon public** key — you'll need these in Step 3

## Step 2 — Create your login

1. In Supabase, go to **Authentication → Users**
2. Click **Add user** → enter your email and a strong password
3. That's your login for the app

## Step 3 — Deploy to Vercel

1. Push this folder to a GitHub repo (github.com → New repo → upload files)
2. Go to https://vercel.com and create a free account
3. Click **Add New Project** → import your GitHub repo
4. Under **Environment Variables**, add:
   - `REACT_APP_SUPABASE_URL` → your Supabase Project URL
   - `REACT_APP_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Deploy**

Vercel will build and give you a live URL (e.g. `lt-coaching.vercel.app`).

## Local development

```bash
cp .env.example .env
# Fill in your Supabase values in .env

npm install
npm start
```

## Notes

- Progress photos upload to Supabase Storage (free tier: 1GB)
- All data is saved to your Supabase database
- The app works on any device — phone, tablet, desktop
