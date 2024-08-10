// Define the 'user' property on the 'Request' type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export interface SignUpPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
}

export interface SignInPayload {
  identifier: string;
  password: string;
}
