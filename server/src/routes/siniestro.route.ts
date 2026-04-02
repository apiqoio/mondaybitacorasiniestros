import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { validateMondaySession } from '../middleware/auth.middleware';
import { fetchSiniestro } from '../services/siniestro.service';
import { logger } from '../utils/logger';

const router = Router();

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  keyGenerator: (req) =>
    `${req.mondayContext?.userId}:${req.mondayContext?.accountId}`,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta más tarde' },
});

const ParamsSchema = z.object({
  numero: z.string().regex(/^\d+$/, 'El número de siniestro debe ser numérico'),
});

router.get(
  '/:numero',
  validateMondaySession,
  limiter,
  async (req: Request, res: Response) => {
    const parsed = ParamsSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: 'Número de siniestro inválido' });
      return;
    }

    const { numero } = parsed.data;

    try {
      const data = await fetchSiniestro(numero);

      logger.info({
        action: 'siniestro_consultado',
        userId: req.mondayContext?.userId,
        accountId: req.mondayContext?.accountId,
        numero,
      });

      res.json({ data });
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      const status = error.status ?? 500;
      const message =
        status === 404
          ? 'Siniestro no encontrado'
          : status === 502
            ? 'No se pudo conectar con la API de siniestros'
            : 'Error interno del servidor';

      logger.error({
        action: 'siniestro_error',
        userId: req.mondayContext?.userId,
        numero,
        status,
      });

      res.status(status).json({ error: message });
    }
  },
);

export default router;
