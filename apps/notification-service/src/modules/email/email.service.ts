import nodemailer from 'nodemailer';
import { config } from '@/config/env';
import { logger } from '@/shared/utils/logger';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html,
      });
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
