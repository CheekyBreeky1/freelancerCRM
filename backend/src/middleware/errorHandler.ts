import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../modules/auth/auth.service';
import { EmployerError } from '../modules/employers/employers.service';
import { TaskError } from '../modules/tasks/tasks.service';
import { SubTaskError } from '../modules/subtasks/subtasks.service';
import { UserError } from '../modules/users/users.service';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // AuthError
  if (err instanceof AuthError) {
    const statusCode = mapAuthErrorToStatus(err.code);
    return res.status(statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  // EmployerError
  if (err instanceof EmployerError) {
    const statusCode = err.code === 'NOT_FOUND' ? 404 : 400;
    return res.status(statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  // TaskError
  if (err instanceof TaskError) {
    const statusCode = err.code === 'NOT_FOUND' ? 404 : 400;
    const errorBody: any = {
      code: err.code,
      message: err.message,
    };
    if (err.field && err.reason) {
      errorBody.details = [{ field: err.field, reason: err.reason }];
    }
    return res.status(statusCode).json({ error: errorBody });
  }

  // SubTaskError
  if (err instanceof SubTaskError) {
    const statusCode = err.code === 'NOT_FOUND' ? 404 : 400;
    const errorBody: any = {
      code: err.code,
      message: err.message,
    };
    if (err.field && err.reason) {
      errorBody.details = [{ field: err.field, reason: err.reason }];
    }
    return res.status(statusCode).json({ error: errorBody });
  }

  // UserError
if (err instanceof UserError) {
    const statusCode =
      err.code === 'NOT_FOUND' ? 404 :
      err.code === 'EMAIL_TAKEN' ? 409 :
      400;
    const errorBody: any = {
      code: err.code,
      message: err.message,
    };
    if (err.field && err.reason) {
      errorBody.details = [{ field: err.field, reason: err.reason }];
    }
    return res.status(statusCode).json({ error: errorBody });
  }

  // Валидация (заготовка под express-openapi-validator)
  if (err.name === 'ValidationError' || (err as any).status === 400) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: (err as any).errors ?? [],
      },
    });
  }

  // Неизвестная ошибка
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