import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import translationRoutes from './routes/translationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { translateText } from './controllers/translationController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'VoxAI API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
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

async function start() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`VoxAI API running on http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
