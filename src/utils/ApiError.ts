interface ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
}

class ApiError extends Error {
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // To distinguish between operational and non-operational errors
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
