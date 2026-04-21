import { ZodError } from "zod";

export const validateBody = (schema) => (req, _res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      error.statusCode = 400;
    }
    next(error);
  }
};

export const validateQuery = (schema) => (req, _res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      error.statusCode = 400;
    }
    next(error);
  }
};

