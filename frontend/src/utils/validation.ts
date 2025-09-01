import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must not exceed 50 characters'),
  
  email: z.string()
    .email('Please provide a valid email address'),
  
  dateOfBirth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate < today;
    }, 'Date of birth cannot be in the future')
});

export const loginSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address')
});

export const otpSchema = z.object({
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers')
});

export const noteSchema = z.object({
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must not exceed 200 characters'),
  
  content: z.string()
    .min(1, 'Content cannot be empty')
    .max(10000, 'Content must not exceed 10000 characters')
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
export type NoteFormData = z.infer<typeof noteSchema>;
