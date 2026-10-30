import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import employersRoutes from './modules/employers/employers.routes';
import tasksRoutes from './modules/tasks/tasks.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/employers', employersRoutes);
app.use('/api/v1/tasks', tasksRoutes);

// Error handler — ВСЕГДА последним
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});