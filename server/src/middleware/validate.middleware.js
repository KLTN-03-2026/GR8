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
    const validatedQuery = schema.parse(req.query);
    // Merge validated query back into req.query without reassigning
    Object.assign(req.query, validatedQuery);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      error.statusCode = 400;
    }
    next(error);
  }
};

