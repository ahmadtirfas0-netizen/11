import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export const getAllMails = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams: any[] = [limit, offset];
    let paramIndex = 3;

    // Apply role-based filtering
    if (user.role === 'manager') {
      whereClause = `WHERE (m.from_department_id = $${paramIndex} OR m.to_department_id = $${paramIndex})`;
      queryParams.push(user.department_id);
      paramIndex++;
    } else if (user.role === 'head') {
      whereClause = `WHERE EXISTS (
        SELECT 1 FROM referrals r 
        WHERE r.mail_id = m.id AND r.section_id = $${paramIndex}
      )`;
      queryParams.push(user.section_id);
      paramIndex++;
    }

    const mailsQuery = `
      SELECT m.*, 
             fd.name as from_department_name,
             td.name as to_department_name,
             u.full_name as uploader_name,
             COUNT(a.id) as attachment_count
      FROM mails m
      LEFT JOIN departments fd ON m.from_department_id = fd.id
      LEFT JOIN departments td ON m.to_department_id = td.id
      LEFT JOIN users u ON m.uploader_id = u.id
      LEFT JOIN attachments a ON m.id = a.mail_id
      ${whereClause}
      GROUP BY m.id, fd.name, td.name, u.full_name
      ORDER BY m.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT m.id) as total
      FROM mails m
      ${whereClause}
    `;

    const [mailsResult, countResult] = await Promise.all([
      pool.query(mailsQuery, queryParams),
      pool.query(countQuery, queryParams.slice(2))
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const mails = mailsResult.rows.map(mail => ({
      id: mail.id,
      referenceNumber: mail.reference_number,
      mailDate: mail.mail_date,
      subject: mail.subject,
      direction: mail.direction,
      fromDepartment: mail.from_department_name ? { name: mail.from_department_name } : null,
      toDepartment: mail.to_department_name ? { name: mail.to_department_name } : null,
      uploader: { fullName: mail.uploader_name },
      attachments: Array(parseInt(mail.attachment_count || '0')).fill({}),
      createdAt: mail.created_at,
      updatedAt: mail.updated_at
    }));

    res.json({
      success: true,
      message: 'Mails retrieved successfully',
      data: mails,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get mails error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const searchMails = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      dateFrom,
      dateTo,
      departmentId,
      referenceNumber,
      subject,
      direction
    } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Role-based filtering
    if (user.role === 'manager') {
      whereConditions.push(`(m.from_department_id = $${paramIndex} OR m.to_department_id = $${paramIndex})`);
      queryParams.push(user.department_id);
      paramIndex++;
    } else if (user.role === 'head') {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM referrals r 
        WHERE r.mail_id = m.id AND r.section_id = $${paramIndex}
      )`);
      queryParams.push(user.section_id);
      paramIndex++;
    }

    // Search filters
    if (dateFrom) {
      whereConditions.push(`m.mail_date >= $${paramIndex}`);
      queryParams.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      whereConditions.push(`m.mail_date <= $${paramIndex}`);
      queryParams.push(dateTo);
      paramIndex++;
    }

    if (departmentId) {
      whereConditions.push(`(m.from_department_id = $${paramIndex} OR m.to_department_id = $${paramIndex})`);
      queryParams.push(departmentId);
      paramIndex++;
    }

    if (referenceNumber) {
      whereConditions.push(`m.reference_number ILIKE $${paramIndex}`);
      queryParams.push(`%${referenceNumber}%`);
      paramIndex++;
    }

    if (subject) {
      whereConditions.push(`m.subject ILIKE $${paramIndex}`);
      queryParams.push(`%${subject}%`);
      paramIndex++;
    }

    if (direction) {
      whereConditions.push(`m.direction = $${paramIndex}`);
      queryParams.push(direction);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const mailsQuery = `
      SELECT m.*, 
             fd.name as from_department_name,
             td.name as to_department_name,
             u.full_name as uploader_name,
             COUNT(a.id) as attachment_count
      FROM mails m
      LEFT JOIN departments fd ON m.from_department_id = fd.id
      LEFT JOIN departments td ON m.to_department_id = td.id
      LEFT JOIN users u ON m.uploader_id = u.id
      LEFT JOIN attachments a ON m.id = a.mail_id
      ${whereClause}
      GROUP BY m.id, fd.name, td.name, u.full_name
      ORDER BY m.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const result = await pool.query(mailsQuery, queryParams);

    const mails = result.rows.map(mail => ({
      id: mail.id,
      referenceNumber: mail.reference_number,
      mailDate: mail.mail_date,
      subject: mail.subject,
      direction: mail.direction,
      fromDepartment: mail.from_department_name ? { name: mail.from_department_name } : null,
      toDepartment: mail.to_department_name ? { name: mail.to_department_name } : null,
      uploader: { fullName: mail.uploader_name },
      attachments: Array(parseInt(mail.attachment_count || '0')).fill({}),
      createdAt: mail.created_at,
      updatedAt: mail.updated_at
    }));

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: mails,
      meta: {
        page,
        limit,
        total: mails.length,
        totalPages: Math.ceil(mails.length / limit)
      }
    });
  } catch (error) {
    console.error('Search mails error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createMail = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const user = req.user!;
    const {
      reference_number,
      mail_date,
      subject,
      direction,
      from_department_id,
      to_department_id
    } = req.body;

    const mailId = uuidv4();

    // Insert mail
    const mailResult = await client.query(`
      INSERT INTO mails (id, reference_number, mail_date, subject, direction, from_department_id, to_department_id, uploader_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [mailId, reference_number, mail_date, subject, direction, from_department_id, to_department_id, user.id]);

    // Handle file attachments
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      for (const file of files) {
        const attachmentId = uuidv4();
        await client.query(`
          INSERT INTO attachments (id, mail_id, file_path, original_filename, file_size, mime_type)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [attachmentId, mailId, file.path, file.originalname, file.size, file.mimetype]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Mail created successfully',
      data: {
        id: mailResult.rows[0].id,
        referenceNumber: mailResult.rows[0].reference_number,
        mailDate: mailResult.rows[0].mail_date,
        subject: mailResult.rows[0].subject,
        direction: mailResult.rows[0].direction,
        createdAt: mailResult.rows[0].created_at
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create mail error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

export const getMailById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    let whereClause = '';
    let queryParams = [id];

    // Apply role-based filtering
    if (user.role === 'manager') {
      whereClause = 'AND (m.from_department_id = $2 OR m.to_department_id = $2)';
      queryParams.push(user.department_id!);
    } else if (user.role === 'head') {
      whereClause = `AND EXISTS (
        SELECT 1 FROM referrals r 
        WHERE r.mail_id = m.id AND r.section_id = $2
      )`;
      queryParams.push(user.section_id!);
    }

    const mailQuery = `
      SELECT m.*, 
             fd.name as from_department_name,
             td.name as to_department_name,
             u.full_name as uploader_name
      FROM mails m
      LEFT JOIN departments fd ON m.from_department_id = fd.id
      LEFT JOIN departments td ON m.to_department_id = td.id
      LEFT JOIN users u ON m.uploader_id = u.id
      WHERE m.id = $1 ${whereClause}
    `;

    const mailResult = await pool.query(mailQuery, queryParams);

    if (mailResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mail not found'
      });
    }

    // Get attachments
    const attachmentsResult = await pool.query(
      'SELECT * FROM attachments WHERE mail_id = $1',
      [id]
    );

    const mail = mailResult.rows[0];
    
    res.json({
      success: true,
      message: 'Mail retrieved successfully',
      data: {
        id: mail.id,
        referenceNumber: mail.reference_number,
        mailDate: mail.mail_date,
        subject: mail.subject,
        direction: mail.direction,
        fromDepartment: mail.from_department_name ? { name: mail.from_department_name } : null,
        toDepartment: mail.to_department_name ? { name: mail.to_department_name } : null,
        uploader: { fullName: mail.uploader_name },
        attachments: attachmentsResult.rows.map(att => ({
          id: att.id,
          originalFilename: att.original_filename,
          fileSize: att.file_size,
          mimeType: att.mime_type
        })),
        createdAt: mail.created_at,
        updatedAt: mail.updated_at
      }
    });
  } catch (error) {
    console.error('Get mail by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};