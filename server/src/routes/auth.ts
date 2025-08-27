import { Router } from 'express';
import { login, getCurrentUser } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, loginSchema } from '../middleware/validation';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticateToken, getCurrentUser);

export default router;