import { z } from 'zod';

export const emailSchema = z.string().email({ message: 'Invalid email address' });

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' });

export const usernameSchema = z
  .string()
  .min(3, { message: 'Username must be at least 3 characters' })
  .max(20, { message: 'Username must be at most 20 characters' })
  .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' });

export const projectNameSchema = z
  .string()
  .min(3, { message: 'Project name must be at least 3 characters' })
  .max(50, { message: 'Project name must be at most 50 characters' });

export const validateForm = <T extends z.ZodTypeAny>(schema: T, data: unknown) => {
  try {
    schema.parse(data);
    return { success: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    throw error;
  }
};

export const validateAsync = async <T extends z.ZodTypeAny>(schema: T, data: unknown) => {
  return await schema.safeParseAsync(data);
};

export const validatePartial = <T extends z.ZodTypeAny>(schema: T, data: unknown) => {
  return schema.partial().safeParse(data);
};

export const validateWithDefaults = <T extends z.ZodTypeAny>(schema: T, data: unknown) => {
  return schema.default({}).parse(data);
};
