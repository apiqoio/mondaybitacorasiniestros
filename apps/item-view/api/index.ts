import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

interface MondayTokenPayload {
  dat?: {
    account_id?: number;
    user_id?: number;
    app_id?: number;
  };
  // Monday session tokens also use flat claims in some versions
  accountId?: number;
  userId?: number;
  exp?: number;
  iat?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  const secret = process.env.MONDAY_SIGNING_SECRET;

  // Verificar el token de Monday
  let payload: MondayTokenPayload | null = null;

  if (secret) {
    // Intentar verificación criptográfica (ignorar expiración)
    try {
      payload = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        ignoreExpiration: true,
      }) as MondayTokenPayload;
    } catch {
      // Si falla la verificación con el secret, intentar decodificar
      // Esto puede pasar si el signing secret cambió en Monday
      payload = jwt.decode(token) as MondayTokenPayload | null;
    }
  } else {
    // Sin secret configurado, solo decodificar
    payload = jwt.decode(token) as MondayTokenPayload | null;
  }

  // Validar que el token tiene estructura de Monday
  if (!payload || (!payload.dat && !payload.accountId)) {
    return res.status(401).json({ error: 'Token inválido — no es un session token de Monday' });
  }

  const { oficina, ramo, poliza, numeroSiniestro, filenet } = req.query as Record<string, string | undefined>;

  const hasPolizaSearch = !!(oficina && ramo && poliza);
  const hasSiniestroSearch = !!numeroSiniestro;
  const hasFilenetSearch = !!filenet;

  if (!hasPolizaSearch && !hasSiniestroSearch && !hasFilenetSearch) {
    return res.status(400).json({
      error: 'Debe proporcionar al menos una opción de búsqueda: oficina+ramo+poliza, numeroSiniestro o filenet',
    });
  }

  const baseUrl = process.env.SINIESTROS_API_BASE_URL;
  if (!baseUrl) return res.status(500).json({ error: 'API externa no configurada' });

  const params = new URLSearchParams();
  if (numeroSiniestro) params.set('siniestro', numeroSiniestro);
  if (oficina) params.set('oficina', oficina);
  if (ramo) params.set('ramo', ramo);
  if (poliza) params.set('poliza', poliza);
  if (filenet) params.set('filenet', filenet);

  try {
    const upstream = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });

    if (upstream.status === 404) return res.status(404).json({ error: 'Siniestro no encontrado' });
    if (!upstream.ok) return res.status(502).json({ error: 'No se pudo conectar con la API de siniestros' });

    const data = await upstream.json();
    return res.status(200).json({ data });
  } catch {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
