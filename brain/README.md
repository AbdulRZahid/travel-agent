# Travel Agent Brain (FastAPI)

This folder contains the **Brain** service (Python/FastAPI). It exposes:

- `GET /health` -> `{ "status": "ok" }`
- `POST /agent/stream` -> Server-Sent Events (SSE)
- `GET /agent/state/{thread_id}` -> placeholder state

## Local setup (venv)

Prereqs:
- Python **3.12+**

### Option A (recommended): uv

If you have `uv` installed, you can set up the Brain environment in one go:

```bash
uv sync --project brain
```

Run the server:

```bash
uv run --project brain uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Notes:
- `brain/pyproject.toml` is the source of truth for dependencies.
- You can create a lockfile later with `uv lock --project brain` for fully reproducible installs.

### Option B: plain venv + pip

From the repo root:

```bash
python3 -m venv brain/.venv
source brain/.venv/bin/activate
python -m pip install --upgrade pip
pip install -r brain/requirements.txt
```

Run the server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Health check:

```bash
curl -s http://localhost:8000/health
```

## Docker

From the repo root:

```bash
docker compose up -d --build brain
curl -s http://localhost:8000/health
```
