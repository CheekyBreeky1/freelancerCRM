import { prisma } from '../../db/prisma';
import { generateId } from '../../utils/id';

// === Типы ===

export type ListFilters = {
  status?: 'new' | 'active' | 'archived';
  search?: string;
  sort?: 'name' | '-name' | 'createdAt' | '-createdAt';
};

export type CreateEmployerInput = {
  name: string;
  status?: 'new' | 'active' | 'archived';
  company?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  telegram?: string | null;
  website?: string | null;
  notes?: string | null;
};

export type UpdateEmployerInput = Partial<CreateEmployerInput>;

// === Кастомная ошибка ===

export class EmployerError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'VALIDATION_ERROR',
    message: string
  ) {
    super(message);
    this.name = 'EmployerError';
  }
}

// === Список ===

export async function list(userId: string, filters: ListFilters) {
  const where: any = {
    userId,
    deletedAt: null,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search && filters.search.trim()) {
    const search = filters.search.trim();
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy = parseSort(filters.sort);

  const [items, total] = await Promise.all([
    prisma.employer.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            tasks: {
              where: { deletedAt: null },
            },
          },
        },
      },
    }),
    prisma.employer.count({ where }),
  ]);

  return {
    items: items.map(toEmployerResponse),
    total,
  };
}

// === Один по ID ===

export async function getById(userId: string, id: string) {
  const employer = await prisma.employer.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          tasks: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  if (!employer) {
    throw new EmployerError('NOT_FOUND', 'Заказчик не найден');
  }

  return toEmployerResponse(employer);
}

// === Создание ===

export async function create(userId: string, input: CreateEmployerInput) {
  const employer = await prisma.employer.create({
    data: {
      id: generateId(),
      userId,
      name: input.name,
      status: input.status ?? 'new',
      company: input.company ?? null,
      email: input.email ?? null,
      phoneNumber: input.phoneNumber ?? null,
      telegram: input.telegram ?? null,
      website: input.website ?? null,
      notes: input.notes ?? null,
    },
    include: {
      _count: {
        select: {
          tasks: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  return toEmployerResponse(employer);
}

// === Обновление ===

export async function update(
  userId: string,
  id: string,
  input: UpdateEmployerInput
) {
  // Проверяем, что заказчик существует и принадлежит пользователю
  const existing = await prisma.employer.findFirst({
    where: { id, userId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    throw new EmployerError('NOT_FOUND', 'Заказчик не найден');
  }

  // Собираем данные для обновления: только переданные поля
  const data: any = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.status !== undefined) data.status = input.status;
  if (input.company !== undefined) data.company = input.company;
  if (input.email !== undefined) data.email = input.email;
  if (input.phoneNumber !== undefined) data.phoneNumber = input.phoneNumber;
  if (input.telegram !== undefined) data.telegram = input.telegram;
  if (input.website !== undefined) data.website = input.website;
  if (input.notes !== undefined) data.notes = input.notes;

  const employer = await prisma.employer.update({
    where: { id },
    data,
    include: {
      _count: {
        select: {
          tasks: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  return toEmployerResponse(employer);
}

// === Мягкое удаление ===

export async function remove(userId: string, id: string) {
  const existing = await prisma.employer.findFirst({
    where: { id, userId },
    select: { id: true, deletedAt: true },
  });

  if (!existing) {
    throw new EmployerError('NOT_FOUND', 'Заказчик не найден');
  }

  // Если уже удалён — идемпотентно, ничего не делаем
  if (existing.deletedAt) {
    return;
  }

  // Транзакция: мягко удаляем заказчика и обнуляем employerId у его задач
  await prisma.$transaction([
    prisma.employer.update({
      where: { id },
      data: { deletedAt: new Date() },
    }),
    prisma.task.updateMany({
      where: { employerId: id },
      data: { employerId: null },
    }),
  ]);
}

// === Вспомогательные ===

function parseSort(sort?: string): any {
  switch (sort) {
    case 'name':
      return { name: 'asc' };
    case '-name':
      return { name: 'desc' };
    case 'createdAt':
      return { createdAt: 'asc' };
    case '-createdAt':
    case undefined:
      return { createdAt: 'desc' };
    default:
      return { createdAt: 'desc' };
  }
}

function toEmployerResponse(employer: any) {
  return {
    id: employer.id,
    name: employer.name,
    status: employer.status,
    company: employer.company,
    email: employer.email,
    phoneNumber: employer.phoneNumber,
    telegram: employer.telegram,
    website: employer.website,
    notes: employer.notes,
    projectsCount: employer._count?.tasks ?? 0,
    createdAt: employer.createdAt,
    updatedAt: employer.updatedAt,
    deletedAt: employer.deletedAt,
  };
}