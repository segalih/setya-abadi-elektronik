import { Router } from 'express';
import * as VerificationController from './verification.controller';

const router = Router();

router.post('/send-email', VerificationController.sendVerifyEmail);

export default router;
