import { string, z } from 'zod';

const trimmedString = z.string().trim();

export const userMessageSchema = z.object({
  userMessage: trimmedString
    .min(1, 'The message must have at least one character')
    .max(150, 'The message must be up to 150 characters'),
  chatId: string().uuid().optional(),
});

export const chatIdSchema = z.object({
  chatId: string().uuid(),
});
