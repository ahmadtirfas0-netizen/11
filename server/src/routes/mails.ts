import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest, mailSchema } from '../middleware/validation';
import {
  getAllMails,
  searchMails,
  createMail,
  getMailById
} from '../controllers/mailController';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllMails);
router.get('/search', searchMails);
router.get('/:id', getMailById);
router.post('/', requireRole(['admin', 'manager']), upload.array('attachments', 10), validateRequest(mailSchema), createMail);

export default router;