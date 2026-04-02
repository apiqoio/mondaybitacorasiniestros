import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface MondayContext {
  accountId: number;
  userId: number;
  appId: number;
}

declare global {
  namespace Express {
    interface Request {
      mondayContext?: MondayContext;
    }
  }
}

export function validateMondaySession(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  const secret = process.env.MONDAY_SIGNING_SECRET;
  if (!secret) {
    logger.error('MONDAY_SIGNING_SECRET no configurado');
    res.status(500).json({ error: 'Error de configuración del servidor' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as MondayContext;
    req.mondayContext = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
