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

const QuerySchema = z
  .object({
    oficina: z.string().optional(),
    ramo: z.string().optional(),
    poliza: z.string().optional(),
    numeroSiniestro: z.string().optional(),
    filenet: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasPolizaSearch = !!(data.oficina && data.ramo && data.poliza);
      const hasSiniestroSearch = !!data.numeroSiniestro;
      const hasFilenetSearch = !!data.filenet;
      return hasPolizaSearch || hasSiniestroSearch || hasFilenetSearch;
    },
    {
      message:
        'Debe proporcionar al menos una opción de búsqueda: oficina+ramo+poliza, numeroSiniestro o filenet',
    },
  );

router.get(
  '/',
  validateMondaySession,
  limiter,
  async (req: Request, res: Response) => {
    const parsed = QuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Parámetros de búsqueda inválidos' });
      return;
    }

    const { oficina, ramo, poliza, numeroSiniestro, filenet } = parsed.data;

    try {
      const data = await fetchSiniestro({ oficina, ramo, poliza, numeroSiniestro, filenet });

      logger.info({
        action: 'siniestro_consultado',
        userId: req.mondayContext?.userId,
        accountId: req.mondayContext?.accountId,
        oficina,
        ramo,
        poliza,
        numeroSiniestro,
        filenet,
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
        status,
      });

      res.status(status).json({ error: message });
    }
  },
);

export default router;
