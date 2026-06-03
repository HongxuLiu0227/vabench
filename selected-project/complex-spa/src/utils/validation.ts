import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'editor', 'viewer']),
  status: z.enum(['active', 'inactive', 'pending']).default('pending'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export const surveySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  questions: z.array(
    z.object({
      text: z.string().min(5, 'Question text must be at least 5 characters'),
      type: z.enum(['text', 'multiple_choice', 'rating']),
      options: z.array(z.string()).optional(),
      required: z.boolean().default(false),
    })
  ).min(1, 'Survey must have at least one question'),
  deadline: z.date().min(new Date(), 'Deadline must be in the future'),
});

// Form field validation functions
export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string) => {
  return password.length >= 8;
};

export const validatePhone = (phone: string) => {
  return /^\+?[0-9]{10,15}$/.test(phone);
};

// API response validation
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
  timestamp: z.string().datetime(),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;

export const validateApiResponse = (response: unknown): ApiResponse => {
  return apiResponseSchema.parse(response);
};

// Utility validation functions
export const isNotEmpty = (value: string) => value.trim() !== '';

export const isPositiveNumber = (value: number) => value > 0;

export const isFutureDate = (date: Date) => date > new Date();

export const isPastDate = (date: Date) => date < new Date();

export const isUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};