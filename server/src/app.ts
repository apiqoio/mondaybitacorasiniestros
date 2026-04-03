import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import siniestroRouter from './routes/siniestro.route';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        frameAncestors: ["'self'", 'https://*.monday.com'],
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'https://api.monday.com'],
      },
    },
    frameguard: false,
  }),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  }),
);

app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/siniestros', siniestroRouter);

export default app;
