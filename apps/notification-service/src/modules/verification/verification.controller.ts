import { Request, Response } from 'express';
import { verificationService } from './verification.service';
import { sendResponse } from '@/shared/utils/response';

export const sendVerifyEmail = async (req: Request, res: Response) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return sendResponse(res, 400, false, 'Email and token are required');
  }

  try {
    await verificationService.sendVerificationEmail(email, token);
    return sendResponse(res, 200, true, 'Verification email sent successfully');
  } catch (error) {
    return sendResponse(res, 500, false, 'Failed to send verification email');
  }
};
