export default class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message); // Call the parent Error constructor

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4")
            ? "client error"
            : "server error";

        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}
