import { Router } from 'express';
import * as EmailController from './email.controller';

const router = Router();

router.post('/send', EmailController.sendEmail);

export default router;
