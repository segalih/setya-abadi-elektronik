import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import path from 'path';
import { logger } from '@/shared/utils/logger';

class WhatsAppService {
  private sock: any;

  async init() {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../../../auth_info_baileys'));
    const { version, isLatest } = await fetchLatestBaileysVersion();

    logger.info(`WhatsApp Baileys version: ${version.join('.')}, isLatest: ${isLatest}`);

    this.sock = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger as any),
      },
      logger: logger as any,
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        logger.info('Scan this QR code with WhatsApp:');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.info('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
        if (shouldReconnect) {
          this.init();
        }
      } else if (connection === 'open') {
        logger.info('WhatsApp connection opened successfully');
      }
    });
  }

  async sendMessage(phone: string, text: string) {
    if (!this.sock) {
      throw new Error('WhatsApp service not initialized');
    }

    // Format phone number to JID: 628xxx@s.whatsapp.net
    const jid = phone.includes('@s.whatsapp.net') ? phone : `${phone.replace(/\D/g, '')}@s.whatsapp.net`;

    try {
      const sentMsg = await this.sock.sendMessage(jid, { text });
      logger.info(`WhatsApp message sent to ${phone}: ${sentMsg.key.id}`);
      return sentMsg;
    } catch (error) {
      logger.error(`Failed to send WhatsApp message to ${phone}:`, error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();
