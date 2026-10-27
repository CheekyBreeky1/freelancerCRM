import { prisma } from '../../db/prisma';
import { generateId } from '../../utils/id';
import { hashPassword, verifyPassword } from '../../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';

// Типы для возвращаемых значений
export type AuthResult = {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    preferences: {
      theme: string;
      locale: string;
      defaultCurrency: string;
    };
  };
  accessToken: string;
  refreshToken: string;
};

// === Регистрация ===
export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  // 1. Проверяем, что email не занят
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError('EMAIL_TAKEN', 'Email уже используется');
  }

  // 2. Хешируем пароль
  const passwordHash = await hashPassword(password);

  // 3. Создаём пользователя и настройки в одной транзакции
  const user = await prisma.user.create({
    data: {
      id: generateId(),
      name,
      email,
      password: passwordHash,
      preferences: {
        create: {
          theme: 'light',
          locale: 'ru-RU',
          defaultCurrency: 'RUB',
        },
      },
    },
    include: { preferences: true },
  });

  // 4. Генерируем токены
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      preferences: {
        theme: user.preferences!.theme,
        locale: user.preferences!.locale,
        defaultCurrency: user.preferences!.defaultCurrency,
      },
    },
    accessToken,
    refreshToken,
  };
}

// === Логин ===
export async function login(
  email: string,
  password: string
): Promise<AuthResult> {
  // 1. Ищем пользователя
  const user = await prisma.user.findUnique({
    where: { email },
    include: { preferences: true },
  });

  // 2. Если не найден или удалён — одна и та же ошибка
  if (!user || user.deletedAt) {
    throw new AuthError('INVALID_CREDENTIALS', 'Неверный email или пароль');
  }

  // 3. Проверяем пароль
  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    throw new AuthError('INVALID_CREDENTIALS', 'Неверный email или пароль');
  }

  // 4. Генерируем токены
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      preferences: {
        theme: user.preferences!.theme,
        locale: user.preferences!.locale,
        defaultCurrency: user.preferences!.defaultCurrency,
      },
    },
    accessToken,
    refreshToken,
  };
}

// === Refresh ===
export async function refresh(refreshToken: string): Promise<{ accessToken: string }> {
  // 1. Проверяем refresh-токен
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError('UNAUTHORIZED', 'Невалидный refresh-токен');
  }

  // 2. Проверяем, что пользователь существует и не удалён
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.deletedAt) {
    throw new AuthError('UNAUTHORIZED', 'Пользователь не найден');
  }

  // 3. Генерируем новый access-токен
  const accessToken = generateAccessToken(user.id);
  return { accessToken };
}

// === Кастомная ошибка ===
export class AuthError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}