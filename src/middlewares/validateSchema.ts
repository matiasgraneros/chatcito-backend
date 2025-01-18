import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

export function validateSchema(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        res.status(400).json({ errors: messages });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
      return;
    }
  };
}
