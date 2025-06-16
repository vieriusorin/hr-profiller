'use server';

import { z } from 'zod';

export type SignUpState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
  success: boolean;
};

const SignUpSchema = z
  .object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().email().endsWith('@ddroidd.com', 'Only @ddroidd.com email addresses are allowed'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: `Passwords don't match`,
    path: ['confirmPassword'],
  });

export async function signup(prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  const validatedFields = SignUpSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        message: data.error || 'Sign up failed',
        success: false,
      };
    }

    return {
      success: true,
      message: 'Account created successfully!',
    };

  } catch (error) {
    console.error('Sign up error:', error);
    return {
      message: 'An error occurred during sign up',
      success: false,
    };
  }
} 