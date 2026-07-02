import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import translationRoutes from './routes/translationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { translateText } from './controllers/translationController.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configuredOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
  .flatMap((value) => (value ? value.split(',') : []))
  .map((value) => value.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

let server;

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'VoxAI API' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.post('/api/translate', translateText);

app.use('/api/auth', authRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/user', userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

function ensureRequiredEnv() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
}

async function start() {
  try {
    ensureRequiredEnv();
    await connectDatabase();

    server = app.listen(PORT, HOST, () => {
      console.log(`VoxAI API running on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully...`);

  const exit = () => process.exit(0);

  if (server) {
    server.close(() => {
      mongoose.connection.close(false, exit);
    });
    return;
  }

  mongoose.connection.close(false, exit);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
