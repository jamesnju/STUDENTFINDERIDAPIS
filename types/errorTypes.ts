export class GlobalError extends Error {
    statusCode: number;
    status: string;

    constructor(message: string, statusCode: number, status: string) {
        super(message);
        this.statusCode = statusCode;
        this.status = status;
    }
}
