import jwt from 'jsonwebtoken';

// Ensure the JWT_SECRET is defined
const jwtSecret = Bun.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export const signJwtToken = (payload: string | object | Buffer): string => {
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
};

export const verifyJwtToken = (token: string): string | object => {
  return jwt.verify(token, jwtSecret);
};
