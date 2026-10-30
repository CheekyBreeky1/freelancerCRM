import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../db/prisma';

// Расширяем тип Request, чтобы добавить userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Читаем заголовок Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Требуется авторизация',
        },
      });
    }

    // 2. Извлекаем токен
    const token = authHeader.slice('Bearer '.length);

    // 3. Проверяем токен
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      // Различаем «истёк» и «невалиден»
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Access-токен истёк',
          },
        });
      }
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Невалидный токен',
        },
      });
    }

    // 4. Проверяем, что пользователь существует и не удалён
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Пользователь не найден',
        },
      });
    }

    // 5. Кладём userId в req и передаём управление дальше
    req.userId = user.id;
    next();
  } catch (error) {
    next(error);
  }
}