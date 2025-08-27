import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest, departmentSchema, sectionSchema, userSchema } from '../middleware/validation';
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllSections,
  getSectionsByDepartment,
  createSection,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);

// Department routes
router.get('/departments', getAllDepartments);
router.post('/departments', requireRole(['admin']), validateRequest(departmentSchema), createDepartment);
router.put('/departments/:id', requireRole(['admin']), validateRequest(departmentSchema), updateDepartment);
router.delete('/departments/:id', requireRole(['admin']), deleteDepartment);

// Section routes
router.get('/sections', getAllSections);
router.get('/departments/:departmentId/sections', getSectionsByDepartment);
router.post('/sections', requireRole(['admin']), validateRequest(sectionSchema), createSection);

// User routes
router.get('/users', requireRole(['admin']), getAllUsers);
router.post('/users', requireRole(['admin']), validateRequest(userSchema), createUser);
router.put('/users/:id', requireRole(['admin']), validateRequest(userSchema.options({ context: { isUpdate: true } })), updateUser);
router.delete('/users/:id', requireRole(['admin']), deleteUser);

export default router;