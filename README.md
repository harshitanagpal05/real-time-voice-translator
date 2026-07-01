# VoxAI — Real-Time AI Voice & Text Translator

VoxAI is a premium, futuristic translation workspace that enables seamless real-time voice and text translation across 40+ supported languages. Built with a high-fidelity dark glassmorphic design, VoxAI integrates browser-native Speech recognition and Synthesis with a multi-layered translation backend.

---

## 🚀 Features

### 1. Translation Modes
- **🎙 Voice Translation**: Real-time Speech-to-Text (STT) parsing, instant translation, and voice replay (TTS) output. Displays custom 3D Voice Orb vibrations and waves.
- **⌨ Text Translation**: User-controlled multiline translation area. Includes:
  - Live character counts (5,000-character limit).
  - Clear and Copy tools.
  - Manual **Translate** click activation (preventing redundant API requests).
  - Input fields, swap toggles, and language selectors that safely lock/disable during active API requests.

### 2. History Workspace
- Lists previous translations stored in MongoDB, with details for original/translated text, source/target languages, translation type (`Voice` or `Text`), and timestamps.
- Supports instant search, language pair filtering, sorting (Newest, Oldest, Alphabetical), individual record deletions, clearing history, copy-to-clipboard, and text-to-speech replays.

### 3. Insights & Analytics
- Live dashboard displaying totals, voice vs. text splits, top source/target settings, success rate percentages, and recent activity logs.
- Interactive, responsive graphs built using **Chart.js** that instantly scale and adjust colors based on your active accent theme.

### 4. Interactive Languages Page
- Dedicated view showing all 40 supported languages, flags, native names, and speech capability badges.
- Features search filters, localStorage-backed favorites lists, recently used suggestions, and quick selections.

### 5. Settings Console & global Accent Themes
- **Themes**: 8 accent palettes (Purple-Orange, Blue-Cyan, Magenta-Gold, Green-Teal, Red-Rose, Indigo-Violet, Sunset, Ocean) that dynamically recolor the entire application workspace (sidebars, card glows, visualizers, lines, button gradients, and Chart.js graphs).
- **Appearance Modes**: Dark, Light, AMOLED (pure black), and System-matching options.
- **Preferences**: Voice rate controls, auto-speech toggles, accessibility settings (reduced-motion, high-contrast, text sizes), and account management.

---

## 🛠 Tech Stack

- **Frontend**: React (v19), Vite, Framer Motion, Chart.js, Axios
- **Node Backend**: Express, MongoDB (Mongoose), JWT authentication, bcrypt
- **AI Translation API**: Python FastAPI, Googletrans (utilizing Google Translate API)

---

## 💻 Installation & Setup

Ensure you have **MongoDB**, **Node.js**, and **Python 3** installed on your system.

### 1. Start MongoDB Docker Container
```bash
docker run -d --name voxai-mongodb -p 27017:27017 mongo:latest
```

### 2. Run Python Translation Server
```bash
cd backend/API
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Run Node Express Server
Configure your environment variables in `backend/.env`:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/voxai
JWT_SECRET=your_jwt_secret_here
PYTHON_API_URL=http://127.0.0.1:8000
```
Then start the server:
```bash
cd backend
npm install
npm run dev
```

### 4. Run React Client
Configure your environment variables in `ai-translator-frontend/.env`:
```env
VITE_API_URL=http://localhost:5001
```
Then start the dev server:
```bash
cd ai-translator-frontend
npm install
npm run dev
```

The application will be running at **http://localhost:5173**.
