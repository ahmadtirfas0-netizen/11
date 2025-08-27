import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

export const loginSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(6)
});

export const userSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().when('$isUpdate', {
    is: false,
    then: Joi.required().min(6),
    otherwise: Joi.optional().min(6)
  }),
  full_name: Joi.string().required().min(2).max(255),
  role: Joi.string().valid('admin', 'manager', 'head').required(),
  department_id: Joi.string().uuid().optional().allow(null),
  section_id: Joi.string().uuid().optional().allow(null)
});

export const departmentSchema = Joi.object({
  name: Joi.string().required().min(2).max(255)
});

export const sectionSchema = Joi.object({
  name: Joi.string().required().min(2).max(255),
  department_id: Joi.string().uuid().required()
});

export const mailSchema = Joi.object({
  reference_number: Joi.string().required().min(1).max(100),
  mail_date: Joi.date().required(),
  subject: Joi.string().required().min(1).max(1000),
  direction: Joi.string().valid('incoming', 'outgoing').required(),
  from_department_id: Joi.string().uuid().optional().allow(null),
  to_department_id: Joi.string().uuid().optional().allow(null)
});