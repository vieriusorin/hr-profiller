import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import * as schema from '../../../../db/schema';
import { inject, injectable } from 'inversify';
import { DatabaseType, TYPES } from '../../../shared/types';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.Database)
    private readonly db: DatabaseType
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    try {
      // 1. Find user in our database
      const user = await this.db.query.users.findFirst({
        where: eq(schema.users.email, email),
      });

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // 2. Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // 3. Get user's role
      const userRoleRelation = await this.db.query.userRoles.findFirst({
        where: eq(schema.userRoles.userId, user.id),
        with: {
          role: true,
        },
      });

      const roleName = userRoleRelation?.role?.name || 'employee';

      // 4. Return user data (without password hash) in the structure expected by frontend
      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: roleName,
          isActive: user.isActive,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 