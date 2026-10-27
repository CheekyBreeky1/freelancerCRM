import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { AuthError } from './auth.service';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth/refresh';
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 дней в мс

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
  });
}

// === Регистрация ===
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);

    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
}

// === Логин ===
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
}

// === Refresh ===
export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      throw new AuthError('UNAUTHORIZED', 'Refresh-токен отсутствует');
    }

    const { accessToken } = await authService.refresh(refreshToken);
    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
}

// === Logout ===
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    clearRefreshCookie(res);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}