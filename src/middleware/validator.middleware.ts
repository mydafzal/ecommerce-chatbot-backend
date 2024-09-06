import { NextFunction, Request, Response } from "express";
import { Schema, ZodError } from "zod";

export const validateRequest =
  (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = { ...req.body, ...req.params };
      schema.parse(data);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: error.errors.map((error) => ({
            path: error.path,
            message: error.message,
          })),
        });
      }
    }
  };
