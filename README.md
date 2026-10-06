# personal-website

Nate Wang's personal website — Next.js full-stack, deployed to Azure App Service
(B1 plan, Canada Central). Includes an AI Q&A chatbot (`/api/chat` + chat widget).

## Local dev

```bash
npm install
cp .env.example .env.local   # add your AI_API_KEY to enable the chatbot
npm run dev
```

## Chatbot

`POST /api/chat` with `{ "messages": [{ "role": "user", "content": "..." }] }`
streams back an OpenAI-compatible SSE response. Any OpenAI-compatible endpoint
works — set `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`. Without a key it replies
with a "not configured" message. Rate limited to 10 requests/minute per IP.

## Deploy (GitHub Actions → Azure)

Pushes to `main` run `.github/workflows/azure-deploy.yml`, which builds the
standalone output and deploys to the Azure Web App. Required repo secrets:

- `AZURE_WEBAPP_NAME` — the Web App name (e.g. `nate-webapp`)
- `AZURE_WEBAPP_PUBLISH_PROFILE` — the app's publish profile XML

In the Azure portal, add these App Settings on the Web App:

- `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY` (chatbot)
- `WEBSITE_NODE_DEFAULT_VERSION` = `24-lts` (if not set via startup command)

The workflow sets the startup command to `node server.js` (standalone output).
