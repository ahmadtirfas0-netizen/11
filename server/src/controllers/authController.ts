import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(`
      SELECT u.*, d.name as department_name, s.name as section_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN sections s ON u.section_id = s.id
      WHERE u.username = $1
    `, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
          departmentId: user.department_id,
          sectionId: user.section_id,
          department: user.department_name ? { name: user.department_name } : null,
          section: user.section_name ? { name: user.section_name } : null
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    res.json({
      success: true,
      message: 'User data retrieved successfully',
      data: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        departmentId: user.department_id,
        sectionId: user.section_id,
        department: user.department_name ? { name: user.department_name } : null,
        section: user.section_name ? { name: user.section_name } : null
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};