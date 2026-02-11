# Product Compare — Setup & Deployment Guide

## Overview

A web application that analyzes products from Amazon and eBay, finds cross-platform matches, compares them side-by-side, and generates AI-powered buying recommendations using Claude.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Amazon Data:** Rainforest API
- **eBay Data:** eBay Browse API (official, free)
- **AI Insights:** Claude API (Anthropic)
- **Caching:** Upstash Redis (optional, free tier)
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+ and npm
- Git
- API keys (see below)

## API Keys Setup

### 1. Rainforest API (Amazon product data)

1. Sign up at https://www.rainforestapi.com/
2. 14-day free trial available (~$0.008/request after)
3. Copy your API key from the dashboard

### 2. eBay Browse API (free)

1. Register at https://developer.ebay.com/
2. Go to **My Account → Application Keys**
3. Create a **Production** keyset
4. Copy the **App ID (Client ID)** and **Cert ID (Client Secret)**

### 3. Anthropic API (Claude AI)

1. Sign up at https://console.anthropic.com/
2. Go to **API Keys** → Create a new key
3. Copy the key

### 4. Upstash Redis (optional, for caching)

1. Sign up at https://upstash.com/
2. Create a new Redis database
3. Copy the **REST URL** and **REST Token**
4. Or use the Vercel integration: https://vercel.com/integrations/upstash

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/JWRLD617/product-compare.git
cd product-compare
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your keys:

```env
RAINFOREST_API_KEY=your_rainforest_api_key
EBAY_APP_ID=your_ebay_app_id
EBAY_CERT_ID=your_ebay_cert_id
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional (caching)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Production Deployment (Vercel)

### Option A: One-click deploy

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import the repository
4. Add environment variables in the Vercel dashboard
5. Deploy

### Option B: CLI deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Setting environment variables on Vercel

Via CLI:
```bash
vercel env add RAINFOREST_API_KEY
vercel env add EBAY_APP_ID
vercel env add EBAY_CERT_ID
vercel env add ANTHROPIC_API_KEY
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
```

Or via the Vercel dashboard:
**Project Settings → Environment Variables**

After adding variables, redeploy:
```bash
vercel --prod
```

### Custom Domain

1. Go to **Project Settings → Domains** in the Vercel dashboard
2. Add your domain
3. Update DNS records as instructed by Vercel
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page with URL input
│   ├── product/[id]/page.tsx       # Product detail + similar matches
│   ├── compare/[id]/page.tsx       # Comparison dashboard + AI insights
│   └── api/
│       ├── extract/route.ts        # Extract product data from URL
│       ├── match/route.ts          # Find similar products cross-platform
│       ├── compare/route.ts        # Build comparison dataset
│       └── insights/route.ts       # Generate AI insights via Claude
├── lib/
│   ├── scrapers/
│   │   ├── types.ts                # Unified Product interface
│   │   ├── amazon.ts               # Rainforest API integration
│   │   ├── ebay.ts                 # eBay Browse API integration
│   │   ├── url-parser.ts           # Detect platform + extract IDs
│   │   └── normalizer.ts           # Normalize to unified schema
│   ├── matching/
│   │   ├── strategy.ts             # Tiered matching orchestrator
│   │   ├── upc-lookup.ts           # UPC/EAN exact match
│   │   └── keyword-search.ts       # Title/brand fuzzy match
│   ├── ai/
│   │   ├── client.ts               # Anthropic SDK client
│   │   ├── prompts.ts              # Prompt templates
│   │   └── schemas.ts              # Zod schemas for structured output
│   └── cache/
│       └── redis.ts                # Upstash Redis + cached() helper
└── components/
    ├── ui/                         # shadcn/ui primitives
    ├── product-url-form.tsx        # URL input + platform detection
    ├── product-card.tsx            # Compact product summary
    ├── product-detail.tsx          # Full product view
    ├── comparison-table.tsx        # Side-by-side comparison
    ├── rating-display.tsx          # Star ratings
    ├── ai-insights-panel.tsx       # Pros/cons/verdict display
    ├── similar-products-grid.tsx   # Cross-platform matches
    └── platform-badge.tsx          # Amazon/eBay indicator
```

## How It Works

1. **User pastes a product URL** (Amazon or eBay)
2. **URL is parsed** to detect the platform and extract the product ID
3. **Product data is fetched** via Rainforest API (Amazon) or eBay Browse API
4. **Data is normalized** into a unified Product schema
5. **Cross-platform matches are found** using a tiered strategy:
   - Tier 1: UPC/EAN barcode exact match (~95% confidence)
   - Tier 2: Keyword search with title/brand/price scoring (~60-80% confidence)
6. **User selects a match** and views the comparison dashboard
7. **AI insights are generated** via Claude with structured output (pros, cons, verdict, price analysis, buying tips)

## Caching Strategy

All API responses are cached via Upstash Redis to minimize costs and improve performance:

| Data | TTL | Cache Key Pattern |
|---|---|---|
| Product data | 1 hour | `product:{platform}:{id}` |
| Search results | 30 minutes | `search:{platform}:{hash}` |
| Cross-platform matches | 2 hours | `match:{productId}` |
| AI insights | 24 hours | `insights:{hash}` |

Caching is optional — the app works without Redis configured, just without caching.

## Estimated Monthly Costs (personal/demo use)

| Service | Cost |
|---|---|
| Rainforest API | ~$10-15/mo (free trial available) |
| eBay API | Free |
| Claude API | ~$5-10/mo |
| Upstash Redis | Free tier |
| Vercel | Free tier |
| **Total** | **~$15-25/mo** |
