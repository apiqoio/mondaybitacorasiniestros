import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

interface MondayContext {
  accountId: number;
  userId: number;
  appId: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  // Auth
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  const secret = process.env.MONDAY_SIGNING_SECRET;
  if (!secret) return res.status(500).json({ error: 'Error de configuración del servidor' });

  let mondayCtx: MondayContext;
  try {
    mondayCtx = jwt.verify(token, secret) as MondayContext;
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Extraer número de siniestro del path /api/siniestros/:numero
  const url = req.url ?? '';
  const match = url.match(/\/siniestros\/(\d+)/);
  if (!match) return res.status(400).json({ error: 'Número de siniestro inválido' });
  const numero = match[1];

  // Llamar API externa
  const baseUrl = process.env.SINIESTROS_API_BASE_URL;
  const apiToken = process.env.SINIESTROS_API_TOKEN;
  if (!baseUrl || !apiToken) return res.status(500).json({ error: 'API externa no configurada' });

  try {
    const upstream = await fetch(
      `${baseUrl}/siniestros/${encodeURIComponent(numero)}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (upstream.status === 404) return res.status(404).json({ error: 'Siniestro no encontrado' });
    if (!upstream.ok) return res.status(502).json({ error: 'No se pudo conectar con la API de siniestros' });

    const data = await upstream.json();
    return res.status(200).json({ data });
  } catch {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
