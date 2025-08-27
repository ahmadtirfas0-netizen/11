import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Department Controllers
export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY name');
    
    res.json({
      success: true,
      message: 'Departments retrieved successfully',
      data: result.rows.map(dept => ({
        id: dept.id,
        name: dept.name,
        createdAt: dept.created_at,
        updatedAt: dept.updated_at
      }))
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      'INSERT INTO departments (id, name) VALUES ($1, $2) RETURNING *',
      [id, name]
    );

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Create department error:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Department name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const result = await pool.query(
      'UPDATE departments SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Section Controllers
export const getAllSections = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT s.*, d.name as department_name
      FROM sections s
      LEFT JOIN departments d ON s.department_id = d.id
      ORDER BY d.name, s.name
    `);
    
    res.json({
      success: true,
      message: 'Sections retrieved successfully',
      data: result.rows.map(section => ({
        id: section.id,
        name: section.name,
        departmentId: section.department_id,
        department: { name: section.department_name },
        createdAt: section.created_at,
        updatedAt: section.updated_at
      }))
    });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSectionsByDepartment = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;

    const result = await pool.query(
      'SELECT * FROM sections WHERE department_id = $1 ORDER BY name',
      [departmentId]
    );
    
    res.json({
      success: true,
      message: 'Sections retrieved successfully',
      data: result.rows.map(section => ({
        id: section.id,
        name: section.name,
        departmentId: section.department_id,
        createdAt: section.created_at,
        updatedAt: section.updated_at
      }))
    });
  } catch (error) {
    console.error('Get sections by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createSection = async (req: Request, res: Response) => {
  try {
    const { name, department_id } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      'INSERT INTO sections (id, name, department_id) VALUES ($1, $2, $3) RETURNING *',
      [id, name, department_id]
    );

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        departmentId: result.rows[0].department_id,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// User Controllers
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.full_name, u.role, u.department_id, u.section_id,
             u.created_at, u.updated_at,
             d.name as department_name, s.name as section_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN sections s ON u.section_id = s.id
      ORDER BY u.created_at DESC
    `);
    
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.rows.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        departmentId: user.department_id,
        sectionId: user.section_id,
        department: user.department_name ? { name: user.department_name } : null,
        section: user.section_name ? { name: user.section_name } : null,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, full_name, role, department_id, section_id } = req.body;
    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 12);

    const result = await pool.query(`
      INSERT INTO users (id, username, password_hash, full_name, role, department_id, section_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, full_name, role, department_id, section_id, created_at, updated_at
    `, [id, username, password_hash, full_name, role, department_id || null, section_id || null]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        fullName: result.rows[0].full_name,
        role: result.rows[0].role,
        departmentId: result.rows[0].department_id,
        sectionId: result.rows[0].section_id,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, full_name, role, department_id, section_id } = req.body;

    let query = `
      UPDATE users SET 
        username = $1, 
        full_name = $2, 
        role = $3, 
        department_id = $4, 
        section_id = $5,
        updated_at = CURRENT_TIMESTAMP
    `;
    let queryParams = [username, full_name, role, department_id || null, section_id || null];

    if (password) {
      const password_hash = await bcrypt.hash(password, 12);
      query += ', password_hash = $6';
      queryParams.push(password_hash);
      query += ' WHERE id = $7 RETURNING id, username, full_name, role, department_id, section_id, created_at, updated_at';
      queryParams.push(id);
    } else {
      query += ' WHERE id = $6 RETURNING id, username, full_name, role, department_id, section_id, created_at, updated_at';
      queryParams.push(id);
    }

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        fullName: result.rows[0].full_name,
        role: result.rows[0].role,
        departmentId: result.rows[0].department_id,
        sectionId: result.rows[0].section_id,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};