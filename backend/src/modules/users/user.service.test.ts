import { describe, it, expect } from 'vitest';
import * as usersService from './users.service';
import { register } from '../auth/auth.service';
import { prisma } from '../../db/prisma';

// Хелпер: создаёт пользователя и возвращает его id
async function createTestUser(email = 'user@example.com'): Promise<string> {
  const { user } = await register('Тест', email, 'password123');
  return user.id;
}

// ============================================
// getMe
// ============================================

describe('users.service: getMe', () => {
  it('возвращает пользователя с preferences', async () => {
    const userId = await createTestUser('me@example.com');

    const user = await usersService.getMe(userId);

    expect(user.id).toBe(userId);
    expect(user.name).toBe('Тест');
    expect(user.email).toBe('me@example.com');
    expect(user.deletedAt).toBeNull();
    expect(user.preferences).toBeDefined();
    expect(user.preferences.theme).toBe('light');
    expect(user.preferences.locale).toBe('ru-RU');
    expect(user.preferences.defaultCurrency).toBe('RUB');
  });

  it('возвращает NOT_FOUND для несуществующего пользователя', async () => {
    await expect(
      usersService.getMe('unknown123')
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Пользователь не найден',
    });
  });

  it('возвращает NOT_FOUND для мягко удалённого пользователя', async () => {
    const userId = await createTestUser('deleted@example.com');

    // Мягко удаляем пользователя
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    await expect(
      usersService.getMe(userId)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

// ============================================
// updateMe
// ============================================

describe('users.service: updateMe', () => {
  it('обновляет name', async () => {
    const userId = await createTestUser();

    const updated = await usersService.updateMe(userId, {
      name: 'Новое имя',
    });

    expect(updated.name).toBe('Новое имя');
    expect(updated.email).toBe('user@example.com'); // не менялся
    expect(updated.preferences).toBeDefined();
  });

  it('обновляет email на свободный', async () => {
    const userId = await createTestUser('old@example.com');

    const updated = await usersService.updateMe(userId, {
      email: 'new@example.com',
    });

    expect(updated.email).toBe('new@example.com');

    // В БД тоже обновилось
    const inDb = await prisma.user.findUnique({ where: { id: userId } });
    expect(inDb!.email).toBe('new@example.com');
  });

  it('обновляет name и email одновременно', async () => {
    const userId = await createTestUser('old@example.com');

    const updated = await usersService.updateMe(userId, {
      name: 'Новое имя',
      email: 'new@example.com',
    });

    expect(updated.name).toBe('Новое имя');
    expect(updated.email).toBe('new@example.com');
  });

  it('возвращает EMAIL_TAKEN при смене на занятый email', async () => {
    await createTestUser('taken@example.com');
    const userId = await createTestUser('mine@example.com');

    await expect(
      usersService.updateMe(userId, { email: 'taken@example.com' })
    ).rejects.toMatchObject({
      code: 'EMAIL_TAKEN',
      message: 'Email уже используется',
    });
  });

  it('не падает, если email тот же самый', async () => {
    const userId = await createTestUser('same@example.com');

    const updated = await usersService.updateMe(userId, {
      email: 'same@example.com',
    });

    expect(updated.email).toBe('same@example.com');
  });

  it('пустое тело {} — ничего не меняется', async () => {
    const userId = await createTestUser('unchanged@example.com');

    const updated = await usersService.updateMe(userId, {});

    expect(updated.name).toBe('Тест');
    expect(updated.email).toBe('unchanged@example.com');
  });

  it('возвращает NOT_FOUND для удалённого пользователя', async () => {
    const userId = await createTestUser('deleted@example.com');
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    await expect(
      usersService.updateMe(userId, { name: 'Новое' })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

// ============================================
// updatePreferences
// ============================================

describe('users.service: updatePreferences', () => {
  it('обновляет theme', async () => {
    const userId = await createTestUser();

    const prefs = await usersService.updatePreferences(userId, {
      theme: 'dark',
    });

    expect(prefs.theme).toBe('dark');
    expect(prefs.locale).toBe('ru-RU'); // не менялся
    expect(prefs.defaultCurrency).toBe('RUB'); // не менялся

    // В БД тоже
    const inDb = await prisma.userPreferences.findUnique({ where: { userId } });
    expect(inDb!.theme).toBe('dark');
  });

  it('обновляет locale и defaultCurrency', async () => {
    const userId = await createTestUser();

    const prefs = await usersService.updatePreferences(userId, {
      locale: 'en-US',
      defaultCurrency: 'EUR',
    });

    expect(prefs.theme).toBe('light'); // не менялся
    expect(prefs.locale).toBe('en-US');
    expect(prefs.defaultCurrency).toBe('EUR');
  });

  it('обновляет все три поля', async () => {
    const userId = await createTestUser();

    const prefs = await usersService.updatePreferences(userId, {
      theme: 'dark',
      locale: 'en-US',
      defaultCurrency: 'USD',
    });

    expect(prefs.theme).toBe('dark');
    expect(prefs.locale).toBe('en-US');
    expect(prefs.defaultCurrency).toBe('USD');
  });

  it('пустое тело {} — ничего не меняется, возвращает текущие', async () => {
    const userId = await createTestUser();

    const prefs = await usersService.updatePreferences(userId, {});

    expect(prefs.theme).toBe('light');
    expect(prefs.locale).toBe('ru-RU');
    expect(prefs.defaultCurrency).toBe('RUB');
  });

  it('возвращает NOT_FOUND для удалённого пользователя', async () => {
    const userId = await createTestUser('deleted@example.com');
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    await expect(
      usersService.updatePreferences(userId, { theme: 'dark' })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});