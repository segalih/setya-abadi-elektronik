import { Request, Response } from 'express';
import { whatsappService } from './wa.service';
import { sendResponse } from '@/shared/utils/response';

export const sendWAMessage = async (req: Request, res: Response) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return sendResponse(res, 400, false, 'Phone number and message are required');
  }

  try {
    await whatsappService.sendMessage(phone, message);
    return sendResponse(res, 200, true, 'WhatsApp message sent successfully');
  } catch (error) {
    return sendResponse(res, 500, false, 'Failed to send WhatsApp message');
  }
};
