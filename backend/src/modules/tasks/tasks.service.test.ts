import { describe, it, expect } from 'vitest';
import * as tasksService from './tasks.service';
import { TaskError } from './tasks.service';
import * as employersService from '../employers/employers.service';
import { register } from '../auth/auth.service';
import { prisma } from '../../db/prisma';

// Хелпер: создаёт пользователя и возвращает его id
async function createTestUser(email = 'user@example.com'): Promise<string> {
  const { user } = await register('Тест', email, 'password123');
  return user.id;
}

// Хелпер: создаёт заказчика и возвращает его id
async function createTestEmployer(userId: string, name = 'Иван'): Promise<string> {
  const employer = await employersService.create(userId, { name });
  return employer.id;
}

// ============================================
// create
// ============================================

describe('tasks.service: create', () => {
  it('создаёт задачу с минимальными данными', async () => {
    const userId = await createTestUser();

    const task = await tasksService.create(userId, {
      title: 'Сделать лендинг',
    });

    expect(task.id).toHaveLength(10);
    expect(task.title).toBe('Сделать лендинг');
    expect(task.status).toBe('progress');
    expect(task.priority).toBe('medium');
    expect(task.currency).toBe('RUB');
    expect(task.payment).toBe(0);
    expect(task.employerId).toBeNull();
    expect(task.description).toBeNull();
    expect(task.deadline).toBeNull();
    expect(task.subTasks).toEqual([]);

    // Веса вычислены правильно
    const inDb = await prisma.task.findUnique({ where: { id: task.id } });
    expect(inDb!.statusWeight).toBe(0);   // progress
    expect(inDb!.priorityWeight).toBe(1); // medium
  });

  it('создаёт задачу со всеми полями', async () => {
    const userId = await createTestUser();
    const employerId = await createTestEmployer(userId);

    const task = await tasksService.create(userId, {
      employerId,
      title: 'Сделать лендинг',
      currency: 'EUR',
      priority: 'high',
      status: 'review',
      description: 'Заказчик предпочитает синие тона',
      payment: 4500,
      deadline: '2026-10-15',
    });

    expect(task.employerId).toBe(employerId);
    expect(task.currency).toBe('EUR');
    expect(task.priority).toBe('high');
    expect(task.status).toBe('review');
    expect(task.description).toBe('Заказчик предпочитает синие тона');
    expect(task.payment).toBe(4500);
    expect(task.deadline).toBe('2026-10-15');

    const inDb = await prisma.task.findUnique({ where: { id: task.id } });
    expect(inDb!.statusWeight).toBe(1);   // review
    expect(inDb!.priorityWeight).toBe(2); // high
  });

  it('создаёт задачу с subTasks', async () => {
    const userId = await createTestUser();

    const task = await tasksService.create(userId, {
      title: 'Сделать лендинг',
      subTasks: [
        { order: 0, text: 'Договориться об оплате', isComplete: true },
        { order: 1, text: 'Выбрать палитру' },
        { order: 2, text: 'Сделать блок картинок' },
      ],
    });

    expect(task.subTasks!).toHaveLength(3);
    expect(task.subTasks![0].text).toBe('Договориться об оплате');
    expect(task.subTasks![0].isComplete).toBe(true);
    expect(task.subTasks![1].isComplete).toBe(false); // default
    expect(task.subTasks!.map((st) => st.order)).toEqual([0, 1, 2]);
  });

  it('возвращает VALIDATION_ERROR при дубликате order в subTasks', async () => {
    const userId = await createTestUser();

    await expect(
      tasksService.create(userId, {
        title: 'Задача',
        subTasks: [
          { order: 0, text: 'Первый' },
          { order: 0, text: 'Дубль' },
        ],
      })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      field: 'subTasks',
      reason: 'not_unique',
    });
  });

  it('возвращает VALIDATION_ERROR при несуществующем employerId', async () => {
    const userId = await createTestUser();

    await expect(
      tasksService.create(userId, {
        title: 'Задача',
        employerId: 'unknown123',
      })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      field: 'employerId',
      reason: 'not_found',
    });
  });

  it('возвращает VALIDATION_ERROR при чужом employerId', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');
    const employerId = await createTestEmployer(user1);

    await expect(
      tasksService.create(user2, {
        title: 'Задача',
        employerId,
      })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      field: 'employerId',
      reason: 'not_found',
    });
  });

  it('создаёт задачу с employerId: null', async () => {
    const userId = await createTestUser();

    const task = await tasksService.create(userId, {
      title: 'Личный проект',
      employerId: null,
    });

    expect(task.employerId).toBeNull();
  });
});

// ============================================
// getById
// ============================================

describe('tasks.service: getById', () => {
  it('возвращает задачу с subTasks', async () => {
    const userId = await createTestUser();
    const created = await tasksService.create(userId, {
      title: 'Задача',
      subTasks: [
        { order: 1, text: 'Второй' },
        { order: 0, text: 'Первый' },
      ],
    });

    const found = await tasksService.getById(userId, created.id);

    expect(found.id).toBe(created.id);
    expect(found.subTasks!).toHaveLength(2);
    // Отсортированы по order
    expect(found.subTasks![0].order).toBe(0);
    expect(found.subTasks![1].order).toBe(1);
  });

  it('возвращает NOT_FOUND для несуществующей задачи', async () => {
    const userId = await createTestUser();

    await expect(
      tasksService.getById(userId, 'unknown123')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('возвращает NOT_FOUND для чужой задачи', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');
    const task = await tasksService.create(user1, { title: 'Задача' });

    await expect(
      tasksService.getById(user2, task.id)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('возвращает NOT_FOUND для удалённой задачи', async () => {
    const userId = await createTestUser();
    const task = await tasksService.create(userId, { title: 'Задача' });
    await tasksService.remove(userId, task.id);

    await expect(
      tasksService.getById(userId, task.id)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

// ============================================
// list
// ============================================

describe('tasks.service: list', () => {
  it('возвращает пустой список, если задач нет', async () => {
    const userId = await createTestUser();

    const result = await tasksService.list(userId, {});

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('возвращает только задачи текущего пользователя', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');

    await tasksService.create(user1, { title: 'Задача 1' });
    await tasksService.create(user1, { title: 'Задача 2' });
    await tasksService.create(user2, { title: 'Чужая' });

    const result = await tasksService.list(user1, {});

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('не возвращает удалённые задачи', async () => {
    const userId = await createTestUser();
    const task1 = await tasksService.create(userId, { title: 'Первая' });
    await tasksService.create(userId, { title: 'Вторая' });

    await tasksService.remove(userId, task1.id);

    const result = await tasksService.list(userId, {});
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Вторая');
  });

  it('не возвращает subTasks в списке', async () => {
    const userId = await createTestUser();
    await tasksService.create(userId, {
      title: 'Задача',
      subTasks: [{ order: 0, text: 'Первый' }],
    });

    const result = await tasksService.list(userId, {});
    expect(result.items[0].subTasks).toBeUndefined();
  });

  it('фильтрует по status', async () => {
    const userId = await createTestUser();
    await tasksService.create(userId, { title: 'A', status: 'progress' });
    await tasksService.create(userId, { title: 'B', status: 'done' });
    await tasksService.create(userId, { title: 'C', status: 'progress' });

    const result = await tasksService.list(userId, { status: 'progress' });

    expect(result.items).toHaveLength(2);
    expect(result.items.every((t) => t.status === 'progress')).toBe(true);
  });

  it('фильтрует по priority', async () => {
    const userId = await createTestUser();
    await tasksService.create(userId, { title: 'A', priority: 'high' });
    await tasksService.create(userId, { title: 'B', priority: 'low' });
    await tasksService.create(userId, { title: 'C', priority: 'high' });

    const result = await tasksService.list(userId, { priority: 'high' });

    expect(result.items).toHaveLength(2);
    expect(result.items.every((t) => t.priority === 'high')).toBe(true);
  });

  it('фильтрует по employerId', async () => {
    const userId = await createTestUser();
    const employerId = await createTestEmployer(userId);

    await tasksService.create(userId, { title: 'A', employerId });
    await tasksService.create(userId, { title: 'B' });
    await tasksService.create(userId, { title: 'C', employerId });

    const result = await tasksService.list(userId, { employerId });

    expect(result.items).toHaveLength(2);
    expect(result.items.every((t) => t.employerId === employerId)).toBe(true);
  });

  it('возвращает пустой список при несуществующем employerId', async () => {
    const userId = await createTestUser();
    await tasksService.create(userId, { title: 'A' });

    const result = await tasksService.list(userId, { employerId: 'unknown123' });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('ищет по title (регистронезависимо)', async () => {
    const userId = await createTestUser();
    await tasksService.create(userId, { title: 'Сделать лендинг' });
    await tasksService.create(userId, { title: 'Настроить аналитику' });
    await tasksService.create(userId, { title: 'ЛЕНДИНГ для клиента' });

    const result = await tasksService.list(userId, { search: 'лендинг' });

    expect(result.items).toHaveLength(2);
  });

  it('сортирует по умолчанию: незавершённые вверху (statusWeight)', async () => {
    const userId = await createTestUser();
    // Создаём в случайном порядке
    await tasksService.create(userId, { title: 'Paid', status: 'paid' });
    await tasksService.create(userId, { title: 'Progress', status: 'progress' });
    await tasksService.create(userId, { title: 'Done', status: 'done' });
    await tasksService.create(userId, { title: 'Review', status: 'review' });

    const result = await tasksService.list(userId, {});

    const statuses = result.items.map((t) => t.status);
    expect(statuses).toEqual(['progress', 'review', 'done', 'paid']);
  });

  it('сортирует sort=priority: high → medium → low', async () => {
    const userId = await createTestUser();
    await tasksService.create(userId, { title: 'Low', priority: 'low' });
    await tasksService.create(userId, { title: 'High', priority: 'high' });
    await tasksService.create(userId, { title: 'Medium', priority: 'medium' });

    const result = await tasksService.list(userId, { sort: 'priority' });

    const priorities = result.items.map((t) => t.priority);
    expect(priorities).toEqual(['high', 'medium', 'low']);
  });

  it('сортирует sort=deadline: null в конце', async () => {
    const userId = await createTestUser();
    await tasksService.create(userId, { title: 'No deadline', deadline: null });
    await tasksService.create(userId, { title: 'Later', deadline: '2026-12-01' });
    await tasksService.create(userId, { title: 'Sooner', deadline: '2026-11-01' });

    const result = await tasksService.list(userId, { sort: 'deadline' });

    const titles = result.items.map((t) => t.title);
    expect(titles).toEqual(['Sooner', 'Later', 'No deadline']);
  });
});

// ============================================
// update
// ============================================

describe('tasks.service: update', () => {
  it('обновляет переданные поля', async () => {
    const userId = await createTestUser();
    const task = await tasksService.create(userId, {
      title: 'Старое название',
      status: 'progress',
    });

    const updated = await tasksService.update(userId, task.id, {
      title: 'Новое название',
      status: 'done',
    });

    expect(updated.title).toBe('Новое название');
    expect(updated.status).toBe('done');

    // Вес обновился
    const inDb = await prisma.task.findUnique({ where: { id: task.id } });
    expect(inDb!.statusWeight).toBe(2); // done
  });

  it('отвязывает заказчика при employerId: null', async () => {
    const userId = await createTestUser();
    const employerId = await createTestEmployer(userId);
    const task = await tasksService.create(userId, {
      title: 'Задача',
      employerId,
    });

    const updated = await tasksService.update(userId, task.id, {
      employerId: null,
    });

    expect(updated.employerId).toBeNull();
  });

  it('возвращает VALIDATION_ERROR при несуществующем employerId', async () => {
    const userId = await createTestUser();
    const task = await tasksService.create(userId, { title: 'Задача' });

    await expect(
      tasksService.update(userId, task.id, { employerId: 'unknown123' })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      field: 'employerId',
      reason: 'not_found',
    });
  });

  it('возвращает NOT_FOUND для чужой задачи', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');
    const task = await tasksService.create(user1, { title: 'Задача' });

    await expect(
      tasksService.update(user2, task.id, { title: 'Взлом' })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

// ============================================
// remove
// ============================================

describe('tasks.service: remove', () => {
  it('мягко удаляет задачу', async () => {
    const userId = await createTestUser();
    const task = await tasksService.create(userId, { title: 'Задача' });

    await tasksService.remove(userId, task.id);

    const inDb = await prisma.task.findUnique({ where: { id: task.id } });
    expect(inDb!.deletedAt).not.toBeNull();
  });

  it('идемпотентен: повторное удаление не падает', async () => {
    const userId = await createTestUser();
    const task = await tasksService.create(userId, { title: 'Задача' });

    await tasksService.remove(userId, task.id);
    await expect(
      tasksService.remove(userId, task.id)
    ).resolves.toBeUndefined();
  });

  it('возвращает NOT_FOUND для чужой задачи', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');
    const task = await tasksService.create(user1, { title: 'Задача' });

    await expect(
      tasksService.remove(user2, task.id)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});