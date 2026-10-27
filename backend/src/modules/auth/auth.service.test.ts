import { describe, it, expect } from 'vitest';
import { register, login, refresh } from './auth.service';
import { prisma } from '../../db/prisma';

// === Регистрация ===
describe('auth.service: register', () => {
  it('создаёт пользователя и возвращает токены', async () => {
    const result = await register('Тест', 'test@example.com', 'password123');

    // 1. Проверяем возвращаемое значение
    expect(result.user.name).toBe('Тест');
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.id).toHaveLength(10);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    // 2. Проверяем, что пользователь реально в БД
    const userInDb = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: { preferences: true },
    });

    expect(userInDb).not.toBeNull();
    expect(userInDb!.id).toBe(result.user.id);
    expect(userInDb!.name).toBe('Тест');

    // 3. Пароль в БД — хеш, не plaintext
    expect(userInDb!.password).not.toBe('password123');
    expect(userInDb!.password).toHaveLength(60);
    expect(userInDb!.password).toMatch(/^\$2b\$/);

    // 4. Preferences создались с дефолтами
    expect(userInDb!.preferences).not.toBeNull();
    expect(userInDb!.preferences!.theme).toBe('light');
    expect(userInDb!.preferences!.locale).toBe('ru-RU');
    expect(userInDb!.preferences!.defaultCurrency).toBe('RUB');
  });

  it('возвращает ошибку EMAIL_TAKEN, если email занят', async () => {
    await register('Первый', 'taken@example.com', 'password123');

    await expect(
      register('Второй', 'taken@example.com', 'password456')
    ).rejects.toMatchObject({
      code: 'EMAIL_TAKEN',
      message: 'Email уже используется',
    });
  });

  it('не создаёт второго пользователя при занятом email', async () => {
    await register('Первый', 'taken@example.com', 'password123');

    await expect(
      register('Второй', 'taken@example.com', 'password456')
    ).rejects.toThrow();

    // В БД должен быть только один пользователь
    const count = await prisma.user.count({
      where: { email: 'taken@example.com' },
    });
    expect(count).toBe(1);
  });
});

// === Логин ===
describe('auth.service: login', () => {
  it('возвращает пользователя и токены при верных данных', async () => {
    // Подготовка: создаём пользователя через register
    await register('Тест', 'login@example.com', 'password123');

    // Действие
    const result = await login('login@example.com', 'password123');

    // Проверки
    expect(result.user.email).toBe('login@example.com');
    expect(result.user.name).toBe('Тест');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('возвращает INVALID_CREDENTIALS при неверном пароле', async () => {
    await register('Тест', 'login@example.com', 'password123');

    await expect(
      login('login@example.com', 'wrong-password')
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      message: 'Неверный email или пароль',
    });
  });

  it('возвращает INVALID_CREDENTIALS при несуществующем email', async () => {
    await expect(
      login('nonexistent@example.com', 'password123')
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      message: 'Неверный email или пароль',
    });
  });

  it('возвращает INVALID_CREDENTIALS для мягко удалённого пользователя', async () => {
    const { user } = await register('Тест', 'deleted@example.com', 'password123');

    // Мягко удаляем пользователя
    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() },
    });

    await expect(
      login('deleted@example.com', 'password123')
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      message: 'Неверный email или пароль',
    });
  });
});

// === Refresh ===
describe('auth.service: refresh', () => {
  it('возвращает новый access-токен при валидном refresh-токене', async () => {
    const { user, refreshToken } = await register(
      'Тест',
      'refresh@example.com',
      'password123'
    );

    const result = await refresh(refreshToken);

    expect(result.accessToken).toBeDefined();
    // Новый access-токен — не тот же, что был при регистрации
    // (потому что iat/exp могут отличаться, хотя payload тот же)
  });

  it('возвращает UNAUTHORIZED при невалидном токене', async () => {
    await expect(
      refresh('invalid-token-string')
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('возвращает UNAUTHORIZED при передаче access-токена вместо refresh', async () => {
    const { accessToken } = await register(
      'Тест',
      'refresh@example.com',
      'password123'
    );

    // access-токен не имеет type: 'refresh', поэтому verifyRefreshToken упадёт
    await expect(
      refresh(accessToken)
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('возвращает UNAUTHORIZED для удалённого пользователя', async () => {
    const { user, refreshToken } = await register(
      'Тест',
      'deleted-refresh@example.com',
      'password123'
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() },
    });

    await expect(
      refresh(refreshToken)
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'Пользователь не найден',
    });
  });
});