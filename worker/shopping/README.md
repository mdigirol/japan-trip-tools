# Where-to-buy relay (Cloudflare Worker)

The **To buy** tool sends each new list item here. The Worker asks Claude where to buy it on this trip and sends back a short summary and up to three places. The app saves the answer on the item, so it shows offline.

What the app sends: the item, its note, and the list of cities and neighborhood names on the trip (slug and name). Nothing else about the trip.

What it checks, in order:

1. The request comes from `ALLOWED_ORIGINS` (the Pages site).
2. No more than 10 lookups a minute from one IP address.
3. The item is 1–120 characters and the note at most 300.

Model: `claude-sonnet-5-5` at medium effort, set by `MODEL` in `wrangler.toml` (effort is in `src/index.ts`). A lookup is a few thousand tokens, so a cent or two each. If a safety classifier declines an item, the API retries some kinds of decline on its recommended fallback model (`fallbacks: "default"`). If that also declines, the app shows "No suggestion for this one."

The Anthropic API key lives only in Cloudflare as a secret. It's never in this repo, the app or the deploy workflow.

## One-time setup

### 1. API key

At https://console.anthropic.com/settings/keys, create a key named `jtc-shopping`. A separate workspace with a monthly spend limit is a good idea, since the Worker's address is public.

### 2. Deploy the Worker

```bash
cd worker/shopping
npx wrangler@4 login
npx wrangler@4 deploy
npx wrangler@4 secret put ANTHROPIC_API_KEY
```

- `deploy` prints the Worker's address, like `https://jtc-shopping.<your-subdomain>.workers.dev`.
- `secret put` asks you to paste the key.

### 3. Point the app at it

The address is public. Add it to the tracked `.env` at the repo root, then commit and push to `main` (the deploy builds from that file):

```bash
VITE_SHOPPING_URL=https://jtc-shopping.<your-subdomain>.workers.dev
```

Without `VITE_SHOPPING_URL`, To buy still works as a plain list and says suggestions are off.

### Testing on this Mac

Run the Worker locally instead of deploying. Put the local settings in `worker/shopping/.dev.vars` (gitignored):

```bash
ALLOWED_ORIGINS=http://localhost:5173
ANTHROPIC_API_KEY=...
```

Then run `npx wrangler@4 dev --port 8787` in `worker/shopping/`, and start `npm run dev` with `VITE_SHOPPING_URL=http://localhost:8787/` in the environment. Don't commit that URL to `.env`.

## Updating

Pushing to `main` doesn't deploy the Worker. After changing `src/` here or `src/lib/wantAdvice.ts`, run `npx wrangler@4 deploy` again.
