import express, { Request, Response, NextFunction } from "express";

// Middleware for handling routes that don't exist
const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error: any = new Error('API route doesn\'t exist!!');
    error.status = 404; // Set the status for 'Not Found'
    next(error); // Pass the error to the next middleware (typically the error handler)
};

export default notFound;
