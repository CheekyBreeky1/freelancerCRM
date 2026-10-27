import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../modules/auth/auth.service';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // AuthError → превращаем в HTTP-ответ
  if (err instanceof AuthError) {
    const statusCode = mapAuthErrorToStatus(err.code);
    return res.status(statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Валидация от express-openapi-validator (позже)
  if (err.name === 'ValidationError' || (err as any).status === 400) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: (err as any).errors ?? [],
      },
    });
  }

  // Неизвестная ошибка — 500
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Внутренняя ошибка сервера',
    },
  });
}

function mapAuthErrorToStatus(code: string): number {
  switch (code) {
    case 'EMAIL_TAKEN':
      return 409;
    case 'INVALID_CREDENTIALS':
    case 'UNAUTHORIZED':
      return 401;
    case 'NOT_FOUND':
      return 404;
    default:
      return 500;
  }
}