import { z } from 'zod';

const oklchRegex = /^oklch\(.+\)$/;

export const settingsSchema = z.object({
  primaryColor: z.string().regex(oklchRegex, {
    message: 'Must be a valid OKLCH color string',
  }),
  logoUrl: z.string().optional(),
  logoWidth: z.coerce.number().min(1, { message: 'Width must be greater than 0' }),
  logoHeight: z.coerce.number().min(1, { message: 'Height must be greater than 0' }),
  logoAlt: z.string().min(1, { message: 'Alt text is required' }),
  background: z.string().regex(oklchRegex, { message: 'Must be a valid OKLCH color string' }),
  foreground: z.string().regex(oklchRegex, { message: 'Must be a valid OKLCH color string' }),
  card: z.string().regex(oklchRegex, { message: 'Must be a valid OKLCH color string' }),
  cardForeground: z.string().regex(oklchRegex, { message: 'Must be a valid OKLCH color string' }),
  secondary: z.string().regex(oklchRegex, { message: 'Must be a valid OKLCH color string' }),
  accent: z.string().regex(oklchRegex, { message: 'Must be a valid OKLCH color string' }),
  destructive: z.string().regex(oklchRegex, { message: 'Must be a valid OKLCH color string' }),
  border: z.string().regex(oklchRegex, { message: 'Must be a valid OKLCH color string' }),
  input: z.string().regex(oklchRegex, { message: 'Must be a valid OKLCH color string' }),
  radius: z.string().min(1, { message: 'Radius is required' }),
  primaryForeground: z.string().regex(oklchRegex, { message: 'Must be a valid OKLCH color string' }),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>; 