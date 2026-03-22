import app from './app';
import { config } from './config/env';
import { logger } from './shared/utils/logger';
import { whatsappService } from '@/modules/whatsapp/wa.service';

const PORT = config.port;

app.listen(PORT, async () => {
  logger.info(`Notification Service is running on http://localhost:${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);

  // Initialize WhatsApp connection
  try {
    await whatsappService.init();
  } catch (error) {
    logger.error('Failed to initialize WhatsApp service:', error);
  }
});
