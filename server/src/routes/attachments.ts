import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { downloadAttachment, getAttachmentsByMail } from '../controllers/attachmentController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get attachments by mail ID
router.get('/mail/:mailId', getAttachmentsByMail);

// Download attachment by ID
router.get('/:id/download', downloadAttachment);

export default router;