import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const getReferralsBySection = async (req: AuthRequest, res: Response) => {
  try {
    const { sectionId } = req.params;
    const user = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Check if user has access to this section
    if (user.role === 'head' && user.section_id !== sectionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this section'
      });
    }

    const query = `
      SELECT r.*, m.reference_number, m.subject, m.mail_date,
             s.name as section_name, d.name as department_name,
             COUNT(c.id) as comment_count
      FROM referrals r
      JOIN mails m ON r.mail_id = m.id
      JOIN sections s ON r.section_id = s.id
      JOIN departments d ON s.department_id = d.id
      LEFT JOIN comments c ON r.id = c.referral_id
      WHERE r.section_id = $1
      GROUP BY r.id, m.reference_number, m.subject, m.mail_date, s.name, d.name
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM referrals r
      WHERE r.section_id = $1
    `;

    const [referralsResult, countResult] = await Promise.all([
      pool.query(query, [sectionId, limit, offset]),
      pool.query(countQuery, [sectionId])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const referrals = referralsResult.rows.map(row => ({
      id: row.id,
      mailId: row.mail_id,
      sectionId: row.section_id,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      referenceNumber: row.reference_number,
      subject: row.subject,
      mailDate: row.mail_date,
      sectionName: row.section_name,
      departmentName: row.department_name,
      commentCount: parseInt(row.comment_count)
    }));

    res.json({
      success: true,
      message: 'Referrals retrieved successfully',
      data: referrals,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get referrals by section error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getReferralById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const query = `
      SELECT r.*, m.reference_number, m.subject, m.mail_date,
             s.name as section_name, d.name as department_name
      FROM referrals r
      JOIN mails m ON r.mail_id = m.id
      JOIN sections s ON r.section_id = s.id
      JOIN departments d ON s.department_id = d.id
      WHERE r.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    const referral = result.rows[0];

    // Check access permissions
    if (user.role === 'head' && user.section_id !== referral.section_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this referral'
      });
    }

    res.json({
      success: true,
      message: 'Referral retrieved successfully',
      data: {
        id: referral.id,
        mailId: referral.mail_id,
        sectionId: referral.section_id,
        status: referral.status,
        createdAt: referral.created_at,
        updatedAt: referral.updated_at,
        referenceNumber: referral.reference_number,
        subject: referral.subject,
        mailDate: referral.mail_date,
        sectionName: referral.section_name,
        departmentName: referral.department_name
      }
    });
  } catch (error) {
    console.error('Get referral by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createReferral = async (req: AuthRequest, res: Response) => {
  try {
    const { mailId, sectionId } = req.body;
    const id = uuidv4();

    const result = await pool.query(`
      INSERT INTO referrals (id, mail_id, section_id, status)
      VALUES ($1, $2, $3, 'Pending')
      RETURNING *
    `, [id, mailId, sectionId]);

    res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      data: {
        id: result.rows[0].id,
        mailId: result.rows[0].mail_id,
        sectionId: result.rows[0].section_id,
        status: result.rows[0].status,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Create referral error:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Referral already exists for this mail and section'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateReferralStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user!;

    // First check if referral exists and user has access
    const checkQuery = `
      SELECT r.*, s.name as section_name
      FROM referrals r
      JOIN sections s ON r.section_id = s.id
      WHERE r.id = $1
    `;

    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    const referral = checkResult.rows[0];

    // Check access permissions
    if (user.role === 'head' && user.section_id !== referral.section_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this referral'
      });
    }

    const result = await pool.query(`
      UPDATE referrals 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    res.json({
      success: true,
      message: 'Referral status updated successfully',
      data: {
        id: result.rows[0].id,
        mailId: result.rows[0].mail_id,
        sectionId: result.rows[0].section_id,
        status: result.rows[0].status,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Update referral status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteReferral = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM referrals WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    res.json({
      success: true,
      message: 'Referral deleted successfully'
    });
  } catch (error) {
    console.error('Delete referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCommentsByReferral = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    // First check if referral exists and user has access
    const checkQuery = `
      SELECT r.section_id
      FROM referrals r
      WHERE r.id = $1
    `;

    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    const referral = checkResult.rows[0];

    // Check access permissions
    if (user.role === 'head' && user.section_id !== referral.section_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this referral'
      });
    }

    const query = `
      SELECT c.*, u.full_name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.referral_id = $1
      ORDER BY c.created_at ASC
    `;

    const result = await pool.query(query, [id]);

    const comments = result.rows.map(row => ({
      id: row.id,
      referralId: row.referral_id,
      userId: row.user_id,
      text: row.text,
      createdAt: row.created_at,
      user: {
        fullName: row.user_name
      }
    }));

    res.json({
      success: true,
      message: 'Comments retrieved successfully',
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user = req.user!;
    const commentId = uuidv4();

    // First check if referral exists and user has access
    const checkQuery = `
      SELECT r.section_id
      FROM referrals r
      WHERE r.id = $1
    `;

    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    const referral = checkResult.rows[0];

    // Check access permissions
    if (user.role === 'head' && user.section_id !== referral.section_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this referral'
      });
    }

    const result = await pool.query(`
      INSERT INTO comments (id, referral_id, user_id, text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [commentId, id, user.id, text]);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        id: result.rows[0].id,
        referralId: result.rows[0].referral_id,
        userId: result.rows[0].user_id,
        text: result.rows[0].text,
        createdAt: result.rows[0].created_at,
        user: {
          fullName: user.full_name
        }
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};