import { Router } from 'express';
import * as NotifyController from './notify.controller';

const router = Router();

router.post('/order-update', NotifyController.handleOrderUpdate);
router.post('/payment-success', NotifyController.handlePaymentSuccess);
router.post('/order-created', NotifyController.handleOrderCreated);

export default router;
