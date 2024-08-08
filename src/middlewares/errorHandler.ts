import logger from '../utils/logger';
import type { Request, Response, NextFunction } from 'express';

export default function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  // log error
  logger.error(error);

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  if (!error.isOperational) {
    // For non-operational errors, you might not want to display the actual error message to the client
    statusCode = 500;
    message = 'Internal server error';
  }

  const errorResponse = {
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  return res.status(statusCode).json(errorResponse);
}
