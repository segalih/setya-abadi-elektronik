import { Router } from 'express';
import * as WAController from './wa.controller';

const router = Router();

router.post('/send', WAController.sendWAMessage);

export default router;
