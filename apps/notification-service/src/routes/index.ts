import { Router } from 'express';
import emailRoutes from '@/modules/email/email.routes';
import waRoutes from '@/modules/whatsapp/wa.routes';
import verificationRoutes from '@/modules/verification/verification.routes';
import notifyRoutes from '@/modules/notify/notify.routes';

const router = Router();

router.use('/email', emailRoutes);
router.use('/whatsapp', waRoutes);
router.use('/verification', verificationRoutes);
router.use('/notify', notifyRoutes);

export default router;
