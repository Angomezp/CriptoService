export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode = 500, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_ERROR', details?: any) {
    super(message, 400, code, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT_ERROR', details?: any) {
    super(message, 409, code, details);
  }
}