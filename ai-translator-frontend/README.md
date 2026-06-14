# VoxAI — Real-Time Voice Translator

A web-based real-time translation application that converts live speech into multiple languages instantly. **VoxAI** (Voice Artificial Intelligence) provides a premium dark glassmorphism UI, real-time subtitles, translation history, settings, and analytics.

---

## Live Demo

https://real-time-voice-translator-woad.vercel.app

---

## Features

- **Real-time voice translation** — Speak and get instant translations
- **Multi-language support** — Translate across 12+ languages
- **AI voice recognition** — Browser speech recognition with backend fallback
- **Natural voice output** — Text-to-speech for translated text
- **Translation history** — View and replay previous translations
- **Premium dashboard** — Sidebar navigation, VoiceOrb, glassmorphism UI
- **Settings** — Profile, translation prefs, voice, theme customization
- **VoxAI Pro modal** — Upgrade plans and premium features
- **How It Works** — Platform workflow and feature overview
- **About Founder** — Founder profile with social links
- **Analytics & Admin** — Usage insights and admin tools

---

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** CSS (glassmorphism, Framer Motion animations)
- **3D:** Three.js / React Three Fiber (VoiceOrb)
- **APIs:** Browser Speech Recognition, FastAPI backend, MyMemory fallback
- **Deployment:** Vercel
- **Version Control:** Git & GitHub

---

## Project Structure

```
├── src/
│   ├── api/              # Auth & translator API clients
│   ├── components/       # UI components (Sidebar, VoiceOrb, etc.)
│   ├── context/          # Auth & settings context
│   ├── hooks/            # useTranslator and helpers
│   ├── pages/            # Dashboard, Settings, Login, etc.
│   └── utils/            # Session & settings persistence
├── index.html
├── package.json
└── vite.config.js
```

---

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env` file (not committed):

```
VITE_API_URL=http://127.0.0.1:8001
```

---

## Deployment

Deployed on Vercel with automatic CI/CD. Pushes to `main` trigger redeployment.

---

## Notes

- Microphone permission is required for voice translation.
- Best experienced on modern Chromium-based browsers.
- `.env`, `node_modules/`, and `dist/` are gitignored.

---

## Author

**Harshita Nagpal** — Founder & Developer, VoxAI

- LinkedIn: https://www.linkedin.com/in/harshita-nagpal05/
- GitHub: https://github.com/harshitanagpal05
