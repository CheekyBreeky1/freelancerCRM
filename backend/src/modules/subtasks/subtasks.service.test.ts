import { describe, it, expect } from 'vitest';
import * as subtasksService from './subtasks.service';
import { SubTaskError } from './subtasks.service';
import * as tasksService from '../tasks/tasks.service';
import { register } from '../auth/auth.service';
import { prisma } from '../../db/prisma';

// Хелпер: создаёт пользователя и возвращает его id
async function createTestUser(email = 'user@example.com'): Promise<string> {
  const { user } = await register('Тест', email, 'password123');
  return user.id;
}

// Хелпер: создаёт задачу и возвращает её id
async function createTestTask(userId: string, title = 'Задача'): Promise<string> {
  const task = await tasksService.create(userId, { title });
  return task.id;
}

// ============================================
// list
// ============================================

describe('subtasks.service: list', () => {
  it('возвращает пустой массив, если подпунктов нет', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);

    const result = await subtasksService.list(userId, taskId);

    expect(result).toEqual([]);
  });

  it('возвращает подпункты, отсортированные по order', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);

    await subtasksService.create(userId, taskId, { order: 2, text: 'Третий' });
    await subtasksService.create(userId, taskId, { order: 0, text: 'Первый' });
    await subtasksService.create(userId, taskId, { order: 1, text: 'Второй' });

    const result = await subtasksService.list(userId, taskId);

    expect(result).toHaveLength(3);
    expect(result.map((st) => st.order)).toEqual([0, 1, 2]);
    expect(result.map((st) => st.text)).toEqual(['Первый', 'Второй', 'Третий']);
  });

  it('возвращает NOT_FOUND для несуществующей задачи', async () => {
    const userId = await createTestUser();

    await expect(
      subtasksService.list(userId, 'unknown123')
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Задача не найдена',
    });
  });

  it('возвращает NOT_FOUND для чужой задачи', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');
    const taskId = await createTestTask(user1);

    await expect(
      subtasksService.list(user2, taskId)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('возвращает NOT_FOUND для удалённой задачи', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);
    await tasksService.remove(userId, taskId);

    await expect(
      subtasksService.list(userId, taskId)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

// ============================================
// create
// ============================================

describe('subtasks.service: create', () => {
  it('создаёт подпункт', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);

    const subtask = await subtasksService.create(userId, taskId, {
      order: 0,
      text: 'Договориться об оплате',
    });

    expect(subtask.id).toHaveLength(10);
    expect(subtask.order).toBe(0);
    expect(subtask.text).toBe('Договориться об оплате');
    expect(subtask.isComplete).toBe(false); // default

    // Проверяем, что запись в БД
    const inDb = await prisma.subTask.findUnique({ where: { id: subtask.id } });
    expect(inDb).not.toBeNull();
    expect(inDb!.taskId).toBe(taskId);
  });

  it('создаёт подпункт с isComplete: true', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);

    const subtask = await subtasksService.create(userId, taskId, {
      order: 0,
      isComplete: true,
      text: 'Сделано',
    });

    expect(subtask.isComplete).toBe(true);
  });

  it('возвращает VALIDATION_ERROR при дубликате order', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);

    await subtasksService.create(userId, taskId, { order: 0, text: 'Первый' });

    await expect(
      subtasksService.create(userId, taskId, { order: 0, text: 'Дубль' })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      field: 'order',
      reason: 'not_unique',
    });
  });

  it('разрешает одинаковый order в разных задачах', async () => {
    const userId = await createTestUser();
    const task1 = await createTestTask(userId, 'Задача 1');
    const task2 = await createTestTask(userId, 'Задача 2');

    await subtasksService.create(userId, task1, { order: 0, text: 'A' });
    // В другой задаче order: 0 — валидно
    const subtask = await subtasksService.create(userId, task2, {
      order: 0,
      text: 'B',
    });

    expect(subtask.order).toBe(0);
  });

  it('возвращает NOT_FOUND для несуществующей задачи', async () => {
    const userId = await createTestUser();

    await expect(
      subtasksService.create(userId, 'unknown123', { order: 0, text: 'A' })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('возвращает NOT_FOUND для чужой задачи', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');
    const taskId = await createTestTask(user1);

    await expect(
      subtasksService.create(user2, taskId, { order: 0, text: 'A' })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

// ============================================
// update
// ============================================

describe('subtasks.service: update', () => {
  it('обновляет переданные поля', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);
    const subtask = await subtasksService.create(userId, taskId, {
      order: 0,
      text: 'Старый текст',
    });

    const updated = await subtasksService.update(userId, taskId, subtask.id, {
      text: 'Новый текст',
      isComplete: true,
    });

    expect(updated.text).toBe('Новый текст');
    expect(updated.isComplete).toBe(true);
    expect(updated.order).toBe(0); // не менялся
  });

  it('разрешает установить order на текущий (тот же самый)', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);
    const subtask = await subtasksService.create(userId, taskId, {
      order: 5,
      text: 'A',
    });

    // Устанавливаем order в то же значение — не ошибка
    const updated = await subtasksService.update(userId, taskId, subtask.id, {
      order: 5,
    });

    expect(updated.order).toBe(5);
  });

  it('возвращает VALIDATION_ERROR при order, занятом другим подпунктом', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);

    await subtasksService.create(userId, taskId, { order: 0, text: 'A' });
    const subtask = await subtasksService.create(userId, taskId, {
      order: 1,
      text: 'B',
    });

    await expect(
      subtasksService.update(userId, taskId, subtask.id, { order: 0 })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      field: 'order',
      reason: 'not_unique',
    });
  });

  it('возвращает NOT_FOUND для несуществующего подпункта', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);

    await expect(
      subtasksService.update(userId, taskId, 'unknown123', { text: 'A' })
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Подпункт не найден',
    });
  });

  it('возвращает NOT_FOUND для подпункта из другой задачи', async () => {
    const userId = await createTestUser();
    const task1 = await createTestTask(userId, 'Задача 1');
    const task2 = await createTestTask(userId, 'Задача 2');

    const subtask = await subtasksService.create(userId, task1, {
      order: 0,
      text: 'A',
    });

    // Пытаемся обновить подпункт task1 через task2
    await expect(
      subtasksService.update(userId, task2, subtask.id, { text: 'Взлом' })
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Подпункт не найден',
    });
  });

  it('возвращает NOT_FOUND для чужой задачи', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');
    const taskId = await createTestTask(user1);
    const subtask = await subtasksService.create(user1, taskId, {
      order: 0,
      text: 'A',
    });

    await expect(
      subtasksService.update(user2, taskId, subtask.id, { text: 'Взлом' })
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Задача не найдена',
    });
  });
});

// ============================================
// remove
// ============================================

describe('subtasks.service: remove', () => {
  it('жёстко удаляет подпункт', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);
    const subtask = await subtasksService.create(userId, taskId, {
      order: 0,
      text: 'A',
    });

    await subtasksService.remove(userId, taskId, subtask.id);

    // Проверяем, что записи физически нет
    const inDb = await prisma.subTask.findUnique({ where: { id: subtask.id } });
    expect(inDb).toBeNull();
  });

  it('не идемпотентен: повторное удаление — NOT_FOUND', async () => {
    const userId = await createTestUser();
    const taskId = await createTestTask(userId);
    const subtask = await subtasksService.create(userId, taskId, {
      order: 0,
      text: 'A',
    });

    await subtasksService.remove(userId, taskId, subtask.id);

    await expect(
      subtasksService.remove(userId, taskId, subtask.id)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Подпункт не найден',
    });
  });

  it('возвращает NOT_FOUND для подпункта из другой задачи', async () => {
    const userId = await createTestUser();
    const task1 = await createTestTask(userId, 'Задача 1');
    const task2 = await createTestTask(userId, 'Задача 2');

    const subtask = await subtasksService.create(userId, task1, {
      order: 0,
      text: 'A',
    });

    await expect(
      subtasksService.remove(userId, task2, subtask.id)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Подпункт не найден',
    });
  });

  it('возвращает NOT_FOUND для чужой задачи', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');
    const taskId = await createTestTask(user1);
    const subtask = await subtasksService.create(user1, taskId, {
      order: 0,
      text: 'A',
    });

    await expect(
      subtasksService.remove(user2, taskId, subtask.id)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Задача не найдена',
    });
  });
});