import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger/swagger.json';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';
import healthRoutes from './routes/health.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/health', healthRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

const errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
  const status: number = (err as { status?: number }).status ?? 500;
  const message = status < 500 ? (err as Error).message : 'Internal Server Error';
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
};
app.use(errorHandler);

export default app;
