import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

const errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
  const status: number = (err as { status?: number }).status ?? 500;
  const message = status < 500 ? (err as Error).message : 'Internal Server Error';
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
};
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
