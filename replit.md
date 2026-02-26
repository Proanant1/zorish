# Social Media Hub

A full-stack social media community platform built with React, Express, and PostgreSQL.

## Overview

A feature-rich social media platform similar to Twitter/Instagram with:
- User authentication (register, login, forgot/reset password)
- Posts with text, images, video, audio, and polls
- Stories (24-hour expiring content)
- Real-time messaging/chat between users
- Notifications system
- Follow/unfollow users, follow requests for private accounts
- Likes, dislikes, comments, reposts, bookmarks
- Trending hashtags and explore page
- User profiles with verification badges
- Creator Studio
- Donation page (BTC/TRX crypto)
- Get Verified flow (Razorpay payment integration)
- Settings: privacy, language, notifications, blocked users
- Object storage for media uploads (via Replit integration)

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (via Drizzle ORM + raw SQL migrations)
- **Auth**: Session-based (express-session + connect-pg-simple)
- **Media**: Replit Object Storage (Google Cloud Storage)

## Architecture

- `client/src/pages/` - All page components (feed, auth, profile, chat, etc.)
- `client/src/components/` - Shared components (sidebar, post-card, story-bar, etc.)
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database storage layer
- `server/migrate.ts` - Schema migration using raw SQL (CREATE TABLE IF NOT EXISTS)
- `server/seed.ts` - Seed data for initial setup
- `shared/schema.ts` - Drizzle schema + Zod types

## Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (provided by Replit)
- `SESSION_SECRET` - Session encryption secret
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - For verification payments (optional)
- `EMAIL_USER` / `EMAIL_PASS` - For password reset emails (optional)

## Running

The app runs via `npm run dev` which starts both the Express backend and Vite frontend on port 5000.
