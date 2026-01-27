# Architecture Overview

This document describes how the platform is structured, how data flows, and
which external services are required to run in production.

## Core Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth, Postgres, Storage, RLS)
- Stripe (billing + subscriptions)
- Redis (Upstash) for rate limiting + caching
- Resend (transactional email)
- Sentry + GA4 (optional observability)

## High-Level Flow

1. User signs in via Supabase Auth.
2. Dashboard uses Supabase to fetch user profile + validations.
3. Validation requests go through API routes.
4. Rate limiting + plan limits are enforced.
5. SAT is queried and results are cached.

## Authentication

- Supabase Auth is the source of truth.
- Client pages request session via `supabase.auth.getSession()`.
- API routes expect JWT in `Authorization: Bearer <token>`.
- Middleware protects `/dashboard/**` by checking auth cookies.

## API Routes (Key Paths)

- `POST /api/validate` (dashboard validation)
- `POST /api/public/validate` (public API via API Key)
- `POST /api/stripe/webhook` (Stripe events)
- `GET/POST /api/alerts/send` (email alerts, cron-ready)

## RFC Validation Pipeline

1. Normalize + validate RFC format.
2. Enforce rate limits (Redis + in-memory fallback).
3. Check plan monthly limits.
4. Query SAT with timeouts + retries.
5. Cache result in Redis for 5 minutes.
6. Return result + metadata (cached, response time).

## Rate Limiting

- Dashboard: per-user, 10 req/min.
- Public API: per API key + per IP.
- Redis provides distributed counters; in-memory fallback for local dev.

## Data Storage

- `users` table stores plan + monthly counters.
- `validations` stores each validation result.
- `api_keys` stores hashed keys and usage counters.
- `subscriptions` syncs Stripe status.
- Storage buckets: `avatars`, `branding`.

## Background Jobs

- `/api/alerts/send` can be called by Vercel Cron to send:
  - Threshold alerts
  - Limit reached alerts
  - Monthly summaries

## Environment Variables

See `env.template` for the full list. Required in production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`

Optional but recommended:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `RESEND_API_KEY`

## Deployment Notes

- Vercel is the default target (see `README.md`).
- Enable Vercel Cron if using email alerts.
- Configure Stripe webhooks to `/api/stripe/webhook`.
- Configure Supabase RLS + migrations in `supabase/migrations/`.
