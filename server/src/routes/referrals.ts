import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';
import {
  getReferralsBySection,
  getReferralById,
  createReferral,
  updateReferralStatus,
  deleteReferral,
  getCommentsByReferral,
  addComment
} from '../controllers/referralController';

const router = Router();

// Validation schemas
const createReferralSchema = Joi.object({
  mailId: Joi.string().uuid().required(),
  sectionId: Joi.string().uuid().required()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Viewed', 'Completed').required()
});

const addCommentSchema = Joi.object({
  text: Joi.string().required().min(1).max(1000)
});

// All routes require authentication
router.use(authenticateToken);

// Get referrals by section
router.get('/section/:sectionId', getReferralsBySection);

// Get referral by ID
router.get('/:id', getReferralById);

// Create new referral (admin and manager only)
router.post('/', requireRole(['admin', 'manager']), validateRequest(createReferralSchema), createReferral);

// Update referral status
router.put('/:id/status', validateRequest(updateStatusSchema), updateReferralStatus);

// Delete referral (admin and manager only)
router.delete('/:id', requireRole(['admin', 'manager']), deleteReferral);

// Get comments for referral
router.get('/:id/comments', getCommentsByReferral);

// Add comment to referral
router.post('/:id/comments', validateRequest(addCommentSchema), addComment);

export default router;