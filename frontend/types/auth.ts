import { components, paths } from './api';
import { JWT } from 'next-auth/jwt';
import { User as NextAuthUser } from 'next-auth';

export type ApiUser = components['schemas']['User'];
export type LoginRequest = paths['/api/v1/auth/login']['post']['requestBody']['content']['application/json'];
export type LoginResponse = paths['/api/v1/auth/login']['post']['responses']['200']['content']['application/json'];
export type UserRole = components['schemas']['UserRole'];

export interface ExtendedUser extends ApiUser, NextAuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

export interface ExtendedJWT extends JWT {
  id: string;
  role: string;
  provider: string;
  backendToken?: string;
  tokenExpiry?: number;
}

// Utility types for API responses
export type AuthApiResponse<T> = {
  user?: T;
  error?: string;
  message?: string;
};

// Session extension types
export interface ExtendedSession {
  user: ExtendedUser;
  backendToken?: string;
  accessToken?: JWT;
  expires: string;
} 

// Type guards for runtime type checking
export const isValidUser = (user: ExtendedUser): user is ExtendedUser => {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    typeof user.role === 'string' &&
    typeof user.isActive === 'boolean'
  );
};

export const isValidLoginResponse = (response: LoginResponse): response is LoginResponse => {
  return Boolean(response && response.user && isValidUser(response.user));
};