/**
 * Token Creation Form Validation Schema
 *
 * Comprehensive validation rules for token creation using Zod.
 * Ensures data integrity and user input validation.
 */

import { z } from 'zod';

/**
 * Supported image MIME types
 */
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Maximum image file size (5MB)
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Token creation form validation schema
 */
export const tokenCreationSchema = z.object({
  // Token name validation
  name: z
    .string()
    .min(3, 'Token name must be at least 3 characters')
    .max(32, 'Token name must not exceed 32 characters')
    .trim()
    .regex(/^[a-zA-Z0-9\s]+$/, 'Token name can only contain letters, numbers, and spaces'),

  // Token symbol validation (uppercase)
  symbol: z
    .string()
    .min(2, 'Token symbol must be at least 2 characters')
    .max(10, 'Token symbol must not exceed 10 characters')
    .trim()
    .regex(/^[A-Z]+$/, 'Token symbol must be uppercase letters only')
    .transform((val) => val.toUpperCase()),

  // Token description validation
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),

  // Image file validation
  image: z
    .custom<File>()
    .refine((file) => file instanceof File, 'Image is required')
    .refine(
      (file) => file.size <= MAX_IMAGE_SIZE,
      'Image size must be less than 5MB'
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .png, and .webp formats are supported'
    ),

  // Total supply validation (1M to 1T)
  totalSupply: z
    .number({
      required_error: 'Total supply is required',
      invalid_type_error: 'Total supply must be a number',
    })
    .min(1_000_000, 'Total supply must be at least 1,000,000 (1M)')
    .max(1_000_000_000_000, 'Total supply must not exceed 1,000,000,000,000 (1T)')
    .int('Total supply must be a whole number')
    .positive('Total supply must be positive'),

  // Website URL validation (optional)
  websiteUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  // Twitter URL validation (optional)
  twitterUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal(''))
    .refine(
      (val) =>
        !val ||
        val.includes('twitter.com') ||
        val.includes('x.com'),
      'Please enter a valid Twitter/X URL'
    )
    .transform((val) => (val === '' ? undefined : val)),

  // Telegram URL validation (optional)
  telegramUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.includes('t.me'),
      'Please enter a valid Telegram URL (t.me/...)'
    )
    .transform((val) => (val === '' ? undefined : val)),
});

/**
 * Type inference from schema
 */
export type TokenCreationFormData = z.infer<typeof tokenCreationSchema>;

/**
 * Helper type for form input (before transformation)
 */
export type TokenCreationFormInput = Omit<TokenCreationFormData, 'symbol'> & {
  symbol: string;
};
