import app from './app';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Servidor iniciado');
});
