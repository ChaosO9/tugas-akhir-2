import { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err, // Include the full error object
            stack: err.stack, // Include the stack trace
        });
    } else {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
};
