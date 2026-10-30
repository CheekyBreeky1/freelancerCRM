import { prisma } from '../../db/prisma';
import type { User, UserPreferences } from '../../generated/prisma/client';

// === Типы ===

export type UpdateMeInput = {
  name?: string;
  email?: string;
};

export type UpdatePreferencesInput = {
  theme?: 'light' | 'dark';
  locale?: 'ru-RU' | 'en-US';
  defaultCurrency?: 'RUB' | 'EUR' | 'USD';
};

export type UserWithPreferencesResponse = {
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

export type PreferencesResponse = {
  theme: string;
  locale: string;
  defaultCurrency: string;
};

type UserWithPreferences = User & { preferences: UserPreferences | null };

// === Кастомная ошибка ===

export class UserError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'VALIDATION_ERROR' | 'EMAIL_TAKEN',
    message: string,
    public field?: string,
    public reason?: string
  ) {
    super(message);
    this.name = 'UserError';
  }
}

// === GET /users/me ===

export async function getMe(userId: string): Promise<UserWithPreferencesResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { preferences: true },
  });

  if (!user || user.deletedAt) {
    throw new UserError('NOT_FOUND', 'Пользователь не найден');
  }

  return toUserWithPreferencesResponse(user);
}

// === PATCH /users/me ===

export async function updateMe(
  userId: string,
  input: UpdateMeInput
): Promise<UserWithPreferencesResponse> {
  // Проверяем, что пользователь существует и не удалён
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, deletedAt: true },
  });

  if (!existing || existing.deletedAt) {
    throw new UserError('NOT_FOUND', 'Пользователь не найден');
  }

  // Если email меняется — проверяем уникальность
  if (input.email !== undefined && input.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (emailTaken) {
      throw new UserError('EMAIL_TAKEN', 'Email уже используется');
    }
  }

  // Собираем данные: только переданные поля
  const data: any = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.email !== undefined) data.email = input.email;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: { preferences: true },
  });

  return toUserWithPreferencesResponse(user);
}

// === PATCH /users/me/preferences ===

export async function updatePreferences(
  userId: string,
  input: UpdatePreferencesInput
): Promise<PreferencesResponse> {
  // Проверяем, что пользователь существует и не удалён
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, deletedAt: true },
  });

  if (!existing || existing.deletedAt) {
    throw new UserError('NOT_FOUND', 'Пользователь не найден');
  }

  // Собираем данные: только переданные поля
  const data: any = {};
  if (input.theme !== undefined) data.theme = input.theme;
  if (input.locale !== undefined) data.locale = input.locale;
  if (input.defaultCurrency !== undefined) data.defaultCurrency = input.defaultCurrency;

  const preferences = await prisma.userPreferences.update({
    where: { userId },
    data,
  });

  return {
    theme: preferences.theme,
    locale: preferences.locale,
    defaultCurrency: preferences.defaultCurrency,
  };
}

// === Вспомогательные ===

function toUserWithPreferencesResponse(
  user: UserWithPreferences
): UserWithPreferencesResponse {
  return {
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
  };
}