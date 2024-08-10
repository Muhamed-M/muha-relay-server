import jwt, { type JwtPayload } from 'jsonwebtoken';
import ApiError from '../utils/ApiError';
import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ensure the JWT_SECRET is defined
const jwtSecret = Bun.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

// Protect routes
exports.protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      next();
    } catch (error) {
      next(new ApiError(401, 'Unauthorized!'));
    }
  }

  if (!token) {
    next(new ApiError(401, 'Unauthorized, no token!'));
  }
};
