import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import siniestroRouter from './routes/siniestro.route';
import { logger } from './utils/logger';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Seguridad: headers HTTP para app embebida en iframe de Monday
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
    frameguard: false, // Monday necesita embeber la app en iframe
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

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/api/siniestros', siniestroRouter);

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Servidor iniciado');
});
