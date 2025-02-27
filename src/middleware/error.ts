import express, { Request, Response, NextFunction } from "express";

// Define a custom error type with a status property
interface CustomError extends Error {
  status?: number;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500; // Default to 500 if no status is provided
  res.status(status).json({ message: err.message });
};

export default errorHandler;
