import { Request, Response } from 'express';
import { emailService } from './email.service';
import { sendResponse } from '@/shared/utils/response';

export const sendEmail = async (req: Request, res: Response) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return sendResponse(res, 400, false, 'Recipient, subject, and body are required');
  }

  try {
    await emailService.sendMail(to, subject, body);
    return sendResponse(res, 200, true, 'Email sent successfully');
  } catch (error) {
    return sendResponse(res, 500, false, 'Failed to send email');
  }
};
