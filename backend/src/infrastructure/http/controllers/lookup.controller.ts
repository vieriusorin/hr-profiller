import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES, DatabaseType } from '../../../shared/types';
import { sql } from 'drizzle-orm';

@injectable()
export class LookupController {
  constructor(
    @inject(TYPES.Database)
    private readonly db: DatabaseType
  ) {}

  async getSkills(req: Request, res: Response): Promise<void> {
    try {
      const { search, category, limit = '50', offset = '0' } = req.query;
      
      let whereConditions: string[] = [];
      
      if (search) {
        whereConditions.push(`LOWER(name) LIKE '%${(search as string).toLowerCase()}%'`);
      }
      
      if (category) {
        whereConditions.push(`LOWER(category) = '${(category as string).toLowerCase()}'`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const result = await this.db.execute(sql`
        SELECT id, name, category, description, created_at as "createdAt", updated_at as "updatedAt"
        FROM skills 
        ${sql.raw(whereClause)}
        ORDER BY name ASC
        LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}
      `);

      const totalResult = await this.db.execute(sql`
        SELECT COUNT(*) as count FROM skills ${sql.raw(whereClause)}
      `);

      const total = totalResult.rows[0]?.count || 0;

      res.status(200).json({
        status: 'success',
        data: result.rows,
        pagination: {
          total: parseInt(total as string),
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + parseInt(limit as string) < parseInt(total as string)
        }
      });
    } catch (error: any) {
      console.error('Error fetching skills:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch skills',
        error: error.message
      });
    }
  }

  async getTechnologies(req: Request, res: Response): Promise<void> {
    try {
      const { search, category, limit = '50', offset = '0' } = req.query;
      
      let whereConditions: string[] = [];
      
      if (search) {
        whereConditions.push(`LOWER(name) LIKE '%${(search as string).toLowerCase()}%'`);
      }
      
      if (category) {
        whereConditions.push(`LOWER(category) = '${(category as string).toLowerCase()}'`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const result = await this.db.execute(sql`
        SELECT id, name, category, description, version, created_at as "createdAt", updated_at as "updatedAt"
        FROM technologies 
        ${sql.raw(whereClause)}
        ORDER BY name ASC
        LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}
      `);

      const totalResult = await this.db.execute(sql`
        SELECT COUNT(*) as count FROM technologies ${sql.raw(whereClause)}
      `);

      const total = totalResult.rows[0]?.count || 0;

      res.status(200).json({
        status: 'success',
        data: result.rows,
        pagination: {
          total: parseInt(total as string),
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + parseInt(limit as string) < parseInt(total as string)
        }
      });
    } catch (error: any) {
      console.error('Error fetching technologies:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch technologies',
        error: error.message
      });
    }
  }

  async getSkillCategories(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.db.execute(sql`
        SELECT DISTINCT category 
        FROM skills 
        WHERE category IS NOT NULL 
        ORDER BY category ASC
      `);

      res.status(200).json({
        status: 'success',
        data: result.rows.map((row: any) => row.category)
      });
    } catch (error: any) {
      console.error('Error fetching skill categories:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch skill categories',
        error: error.message
      });
    }
  }

  async getTechnologyCategories(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.db.execute(sql`
        SELECT DISTINCT category 
        FROM technologies 
        WHERE category IS NOT NULL 
        ORDER BY category ASC
      `);

      res.status(200).json({
        status: 'success',
        data: result.rows.map((row: any) => row.category)
      });
    } catch (error: any) {
      console.error('Error fetching technology categories:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch technology categories',
        error: error.message
      });
    }
  }
} 