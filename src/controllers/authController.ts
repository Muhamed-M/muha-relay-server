import type { Request, Response, NextFunction } from 'express';
import { signUp, signIn } from '../services/authService';

export const signUpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = await signUp(req.body);
    res.status(201).json({
      message: 'User registered successfully',
      data: userData,
    });
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};

export const signInController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = await signIn(req.body);
    res.status(201).json({
      message: 'User logged in successfully',
      data: userData,
    });
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};
