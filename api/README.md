# Python FastAPI (AI generation service)

This directory contains a FastAPI service (`main.py`) that orchestrates Google Gemini for generating text and images for carousels.

## Why it's not routed on Vercel

The production deployment currently uses Next.js API route handlers under `/api/*`. To avoid routing conflicts, this Python service is not wired into Vercel routing. If `vercel.json` were to route `/api/*` to Python, it would bypass the Next.js APIs.

## How to run locally

1. Create and activate a virtual environment.
2. Install dependencies listed in `api/pyproject.toml`.
3. Set `GEMINI_API_KEY` in your environment.
4. Run a local server, for example:

```bash
uvicorn main:app --reload --port 8787
```

The health endpoint will be available at `http://localhost:8787/` and the generation endpoint at `POST http://localhost:8787/api/generate_content`.

## Enabling this API on Vercel later (optional)

If we decide to expose this service alongside Next.js:

- Add a `vercel.json` route that scopes Python under a distinct prefix, e.g. `/pyapi/*`:

```json
{
  "version": 2,
  "builds": [{ "src": "api/main.py", "use": "@vercel/python" }],
  "routes": [{ "src": "/pyapi/(.*)", "dest": "api/main.py" }]
}
```

- Update any callers to use `/pyapi/*` for Python endpoints while keeping Next.js handlers under `/api/*`.


