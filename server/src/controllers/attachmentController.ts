import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

export const getAttachmentsByMail = async (req: AuthRequest, res: Response) => {
  try {
    const { mailId } = req.params;
    const user = req.user!;

    // First check if user has access to this mail
    let mailAccessQuery = '';
    let queryParams = [mailId];

    if (user.role === 'manager') {
      mailAccessQuery = `
        SELECT m.id FROM mails m 
        WHERE m.id = $1 AND (m.from_department_id = $2 OR m.to_department_id = $2)
      `;
      queryParams.push(user.department_id!);
    } else if (user.role === 'head') {
      mailAccessQuery = `
        SELECT m.id FROM mails m 
        WHERE m.id = $1 AND EXISTS (
          SELECT 1 FROM referrals r 
          WHERE r.mail_id = m.id AND r.section_id = $2
        )
      `;
      queryParams.push(user.section_id!);
    } else {
      mailAccessQuery = 'SELECT id FROM mails WHERE id = $1';
    }

    const accessResult = await pool.query(mailAccessQuery, queryParams);

    if (accessResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mail not found or access denied'
      });
    }

    const result = await pool.query(
      'SELECT * FROM attachments WHERE mail_id = $1 ORDER BY created_at ASC',
      [mailId]
    );

    const attachments = result.rows.map(row => ({
      id: row.id,
      mailId: row.mail_id,
      originalFilename: row.original_filename,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      createdAt: row.created_at
    }));

    res.json({
      success: true,
      message: 'Attachments retrieved successfully',
      data: attachments
    });
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const downloadAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    // Get attachment info and check access
    const attachmentQuery = `
      SELECT a.*, m.from_department_id, m.to_department_id
      FROM attachments a
      JOIN mails m ON a.mail_id = m.id
      WHERE a.id = $1
    `;

    const attachmentResult = await pool.query(attachmentQuery, [id]);

    if (attachmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    const attachment = attachmentResult.rows[0];

    // Check access permissions
    if (user.role === 'manager') {
      const hasAccess = attachment.from_department_id === user.department_id || 
                       attachment.to_department_id === user.department_id;
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this attachment'
        });
      }
    } else if (user.role === 'head') {
      // Check if user's section has a referral for this mail
      const referralCheck = await pool.query(
        'SELECT id FROM referrals WHERE mail_id = $1 AND section_id = $2',
        [attachment.mail_id, user.section_id]
      );

      if (referralCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this attachment'
        });
      }
    }

    // Check if file exists
    const filePath = path.resolve(attachment.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_filename}"`);
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Length', attachment.file_size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading file'
        });
      }
    });

  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};