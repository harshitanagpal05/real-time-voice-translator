# VoxAI Translator

AI-powered translation app with a React frontend, Node.js API, Python FastAPI AI service, and MongoDB.

## Architecture

| Service        | Port | Description                    |
|----------------|------|--------------------------------|
| Frontend       | 5173 | React + Vite                   |
| Node API       | 5000 | Auth, history, translation API |
| Python API     | 8000 | FastAPI + googletrans          |
| MongoDB        | 27017| User data & translation history |

## Local development

Requires Node.js, Python 3.11+, and MongoDB running locally.

```powershell
# Start Node API, Python API, and frontend (separate windows)
npm start
```

Or use `start.bat` / `start.ps1` directly.

Copy environment files and adjust as needed:

```powershell
copy backend\.env.example backend\.env
copy ai-translator-frontend\.env.example ai-translator-frontend\.env
```

## Docker

Docker is an optional deployment path. Local `npm start` / `start.ps1` workflows are unchanged.

Copy the root environment template before first run:

```powershell
copy .env.example .env
```

Edit `.env` and set `JWT_SECRET`. Do not commit `.env`.

### Build

```bash
docker compose build
```

### Run

```bash
docker compose up
```

### Stop

```bash
docker compose down
```

### Endpoints

- Frontend: http://localhost:5173
- Node API: http://localhost:5000
- Python API: http://localhost:8000 — `{"status":"Backend running successfully"}`

Inside Docker Compose, the Node API connects to MongoDB at `mongodb://mongodb:27017/voxai` and to the Python service at `http://python-api:8000`.
