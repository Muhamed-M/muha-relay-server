import type { SignInPayload, SignUpPayload } from '../types/authTypes';
import ApiError from '../utils/ApiError';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signJwtToken } from '../utils/auth';

const prisma = new PrismaClient();

export const signUp = async ({ username, email, password, firstName }: SignUpPayload) => {
  // check if user exists
  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) {
    throw new ApiError(409, 'User with this email already exists! Try logging in.');
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      firstName,
    },
  });

  return newUser.id;
};

export const signIn = async ({ identifier, password }: SignInPayload) => {
  // Validate identifier and password
  if (!identifier || !password) {
    throw new ApiError(400, 'You need to enter email/username and password!');
  }

  const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } });

  if (!user) {
    throw new ApiError(404, 'User with this email/username does not exist!');
  }

  // sign jwt token
  const token = signJwtToken({ id: user.id });

  if (await bcrypt.compare(password, user.password)) {
    delete (user as { password?: string }).password; // remove password from user object

    return {
      token,
      user,
    };
  } else {
    throw new ApiError(401, 'Incorrect password!');
  }
};
