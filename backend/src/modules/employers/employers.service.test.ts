import { describe, it, expect } from 'vitest';
import * as employersService from './employers.service';
import { EmployerError } from './employers.service';
import { register } from '../auth/auth.service';
import { prisma } from '../../db/prisma';

// Хелпер: создаёт пользователя и возвращает его id
async function createTestUser(email = 'user@example.com'): Promise<string> {
  const { user } = await register('Тест', email, 'password123');
  return user.id;
}

describe('employers.service: create', () => {
  it('создаёт заказчика с минимальными данными', async () => {
    const userId = await createTestUser();

    const employer = await employersService.create(userId, {
      name: 'Иван',
    });

    expect(employer.id).toHaveLength(10);
    expect(employer.name).toBe('Иван');
    expect(employer.status).toBe('new');
    expect(employer.company).toBeNull();
    expect(employer.email).toBeNull();
    expect(employer.projectsCount).toBe(0);

    // Проверяем, что запись есть в БД
    const inDb = await prisma.employer.findUnique({
      where: { id: employer.id },
    });
    expect(inDb).not.toBeNull();
    expect(inDb!.userId).toBe(userId);
  });

  it('создаёт заказчика со всеми полями', async () => {
    const userId = await createTestUser();

    const employer = await employersService.create(userId, {
      name: 'Анна',
      status: 'active',
      company: 'ООО Вектор',
      email: 'anna@vector.ru',
      phoneNumber: '+7 912 345-67-89',
      telegram: 'anna_s',
      website: 'https://vector.ru',
      notes: 'Лучше писать в telegram',
    });

    expect(employer.name).toBe('Анна');
    expect(employer.status).toBe('active');
    expect(employer.company).toBe('ООО Вектор');
    expect(employer.email).toBe('anna@vector.ru');
    expect(employer.phoneNumber).toBe('+7 912 345-67-89');
    expect(employer.telegram).toBe('anna_s');
    expect(employer.website).toBe('https://vector.ru');
    expect(employer.notes).toBe('Лучше писать в telegram');
  });
});

describe('employers.service: getById', () => {
  it('возвращает заказчика по ID', async () => {
    const userId = await createTestUser();
    const created = await employersService.create(userId, {
      name: 'Иван',
    });

    const found = await employersService.getById(userId, created.id);

    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Иван');
    expect(found.projectsCount).toBe(0);
  });

  it('возвращает NOT_FOUND для несуществующего ID', async () => {
    const userId = await createTestUser();

    await expect(
      employersService.getById(userId, 'unknown123')
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Заказчик не найден',
    });
  });

  it('возвращает NOT_FOUND для чужого заказчика', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');

    const employer = await employersService.create(user1, { name: 'Иван' });

    await expect(
      employersService.getById(user2, employer.id)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('возвращает NOT_FOUND для мягко удалённого заказчика', async () => {
    const userId = await createTestUser();
    const employer = await employersService.create(userId, { name: 'Иван' });

    await employersService.remove(userId, employer.id);

    await expect(
      employersService.getById(userId, employer.id)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('employers.service: list', () => {
  it('возвращает пустой список, если заказчиков нет', async () => {
    const userId = await createTestUser();

    const result = await employersService.list(userId, {});

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('возвращает только заказчиков текущего пользователя', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');

    await employersService.create(user1, { name: 'Иван' });
    await employersService.create(user1, { name: 'Анна' });
    await employersService.create(user2, { name: 'Пётр' });

    const result = await employersService.list(user1, {});

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.items.map((e) => e.name).sort()).toEqual(['Анна', 'Иван']);
  });

  it('не возвращает мягко удалённых', async () => {
    const userId = await createTestUser();
    const employer1 = await employersService.create(userId, { name: 'Иван' });
    await employersService.create(userId, { name: 'Анна' });

    await employersService.remove(userId, employer1.id);

    const result = await employersService.list(userId, {});

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Анна');
  });

  it('фильтрует по статусу', async () => {
    const userId = await createTestUser();
    await employersService.create(userId, { name: 'Иван', status: 'active' });
    await employersService.create(userId, { name: 'Анна', status: 'archived' });
    await employersService.create(userId, { name: 'Пётр', status: 'active' });

    const result = await employersService.list(userId, { status: 'active' });

    expect(result.items).toHaveLength(2);
    expect(result.items.every((e) => e.status === 'active')).toBe(true);
  });

  it('ищет по name и company (регистронезависимо)', async () => {
    const userId = await createTestUser();
    await employersService.create(userId, {
      name: 'Иван',
      company: 'ООО Вектор',
    });
    await employersService.create(userId, {
      name: 'Анна',
      company: 'Studio Nord',
    });
    await employersService.create(userId, { name: 'Пётр' });

    // Поиск по имени
    const byName = await employersService.list(userId, { search: 'иван' });
    expect(byName.items).toHaveLength(1);
    expect(byName.items[0].name).toBe('Иван');

    // Поиск по компании (регистронезависимо)
    const byCompany = await employersService.list(userId, { search: 'ВЕКТОР' });
    expect(byCompany.items).toHaveLength(1);
    expect(byCompany.items[0].name).toBe('Иван');
  });

  it('сортирует по createdAt по убыванию по умолчанию', async () => {
    const userId = await createTestUser();
    const first = await employersService.create(userId, { name: 'Первый' });
    // Небольшая задержка, чтобы createdAt отличались
    await new Promise((r) => setTimeout(r, 10));
    const second = await employersService.create(userId, { name: 'Второй' });

    const result = await employersService.list(userId, {});

    expect(result.items[0].id).toBe(second.id);
    expect(result.items[1].id).toBe(first.id);
  });

  it('сортирует по name возрастанию', async () => {
    const userId = await createTestUser();
    await employersService.create(userId, { name: 'Пётр' });
    await employersService.create(userId, { name: 'Анна' });
    await employersService.create(userId, { name: 'Иван' });

    const result = await employersService.list(userId, { sort: 'name' });

    // Алфавитный порядок (проверяем что отсортировано)
    const names = result.items.map((e) => e.name);
    expect(names).toEqual([...names].sort());
  });
});

describe('employers.service: update', () => {
  it('обновляет переданные поля', async () => {
    const userId = await createTestUser();
    const employer = await employersService.create(userId, {
      name: 'Иван',
      status: 'new',
    });

    const updated = await employersService.update(userId, employer.id, {
      name: 'Иван Петров',
      status: 'active',
      email: 'ivan@example.com',
    });

    expect(updated.name).toBe('Иван Петров');
    expect(updated.status).toBe('active');
    expect(updated.email).toBe('ivan@example.com');
    // Не переданные поля не изменились
    expect(updated.company).toBeNull();
  });

  it('очищает nullable-поля при null', async () => {
    const userId = await createTestUser();
    const employer = await employersService.create(userId, {
      name: 'Иван',
      email: 'ivan@example.com',
      notes: 'Заметка',
    });

    const updated = await employersService.update(userId, employer.id, {
      email: null,
      notes: null,
    });

    expect(updated.email).toBeNull();
    expect(updated.notes).toBeNull();
    expect(updated.name).toBe('Иван');
  });

  it('возвращает NOT_FOUND для чужого заказчика', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');

    const employer = await employersService.create(user1, { name: 'Иван' });

    await expect(
      employersService.update(user2, employer.id, { name: 'Взлом' })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('employers.service: remove', () => {
  it('мягко удаляет заказчика', async () => {
    const userId = await createTestUser();
    const employer = await employersService.create(userId, { name: 'Иван' });

    await employersService.remove(userId, employer.id);

    // Проверяем, что в БД deletedAt установлен
    const inDb = await prisma.employer.findUnique({
      where: { id: employer.id },
    });
    expect(inDb!.deletedAt).not.toBeNull();
  });

  it('обнуляет employerId у задач заказчика', async () => {
    const userId = await createTestUser();
    const employer = await employersService.create(userId, { name: 'Иван' });

    // Создаём задачу с этим заказчиком напрямую через Prisma
    // (чтобы не тянуть зависимость от tasks.service)
    const task = await prisma.task.create({
      data: {
        id: 'task123456',
        userId,
        employerId: employer.id,
        title: 'Задача',
      },
    });

    await employersService.remove(userId, employer.id);

    const taskAfter = await prisma.task.findUnique({
      where: { id: task.id },
    });
    expect(taskAfter!.employerId).toBeNull();
  });

  it('идемпотентен: повторное удаление не падает', async () => {
    const userId = await createTestUser();
    const employer = await employersService.create(userId, { name: 'Иван' });

    await employersService.remove(userId, employer.id);
    // Второй раз — не должно быть ошибки
    await expect(
      employersService.remove(userId, employer.id)
    ).resolves.toBeUndefined();
  });

  it('возвращает NOT_FOUND для чужого заказчика', async () => {
    const user1 = await createTestUser('user1@example.com');
    const user2 = await createTestUser('user2@example.com');

    const employer = await employersService.create(user1, { name: 'Иван' });

    await expect(
      employersService.remove(user2, employer.id)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});