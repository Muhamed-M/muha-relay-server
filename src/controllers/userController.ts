import type { Request, Response, NextFunction } from 'express';
import { findUsersBySearch } from '../services/userService';

export const findUsersBySearchController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await findUsersBySearch(req.query.search?.toString() ?? '', req.user.id);

    res.status(200).json(users);
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};
