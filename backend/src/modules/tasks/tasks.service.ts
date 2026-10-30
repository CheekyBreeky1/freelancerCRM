import { prisma } from '../../db/prisma';
import { generateId } from '../../utils/id';
import type { Task, SubTask } from '../../generated/prisma/client';

// === Константы весов ===

const STATUS_WEIGHT = {
  progress: 0,
  review: 1,
  done: 2,
  paid: 3,
} as const;

const PRIORITY_WEIGHT = {
  low: 0,
  medium: 1,
  high: 2,
} as const;

// === Типы ===

export type ListFilters = {
  status?: 'progress' | 'review' | 'done' | 'paid';
  priority?: 'low' | 'medium' | 'high';
  employerId?: string;
  search?: string;
  sort?: 'deadline' | '-deadline' | 'createdAt' | '-createdAt' | 'priority' | '-priority';
};

export type CreateSubTaskInput = {
  order: number;
  isComplete?: boolean;
  text: string;
};

export type CreateTaskInput = {
  employerId?: string | null;
  title: string;
  currency?: 'RUB' | 'EUR' | 'USD';
  priority?: 'low' | 'medium' | 'high';
  status?: 'progress' | 'review' | 'done' | 'paid';
  description?: string | null;
  payment?: number;
  deadline?: string | null;
  subTasks?: CreateSubTaskInput[];
};

export type UpdateTaskInput = {
  employerId?: string | null;
  title?: string;
  currency?: 'RUB' | 'EUR' | 'USD';
  priority?: 'low' | 'medium' | 'high';
  status?: 'progress' | 'review' | 'done' | 'paid';
  description?: string | null;
  payment?: number;
  deadline?: string | null;
};

// Тип задачи с подпунктами (как возвращает Prisma с include)
type TaskWithSubTasks = Task & { subTasks: SubTask[] };

export type SubTaskResponse = {
  id: string;
  order: number;
  isComplete: boolean;
  text: string;
  createdAt: Date;
};

export type TaskResponse = {
  id: string;
  employerId: string | null;
  title: string;
  currency: string;
  priority: string;
  status: string;
  description: string | null;
  payment: number;
  deadline: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  subTasks?: SubTaskResponse[];
};

// === Кастомная ошибка ===

export class TaskError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'VALIDATION_ERROR',
    message: string,
    public field?: string,
    public reason?: string
  ) {
    super(message);
    this.name = 'TaskError';
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

  if (filters.priority) {
    where.priority = filters.priority;
  }

  // employerId: если передан несуществующий — пустой список (не 400)
  if (filters.employerId) {
    const employer = await prisma.employer.findFirst({
      where: {
        id: filters.employerId,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!employer) {
      return { items: [], total: 0 };
    }

    where.employerId = filters.employerId;
  }

  if (filters.search && filters.search.trim()) {
    const search = filters.search.trim();
    where.title = { contains: search, mode: 'insensitive' };
  }

  const orderBy = parseSort(filters.sort);

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      include: {
        subTasks: {
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.task.count({ where }),
  ]);

  // В списке subTasks не возвращаются (по контракту)
  return {
    items: items.map((task) => toTaskResponse(task, false)),
    total,
  };
}

// === Один по ID ===

export async function getById(userId: string, id: string) {
  const task = await prisma.task.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
    include: {
      subTasks: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!task) {
    throw new TaskError('NOT_FOUND', 'Задача не найдена');
  }

  return toTaskResponse(task, true);
}

// === Создание ===

export async function create(userId: string, input: CreateTaskInput) {
  // Проверяем employerId (если передан)
  await validateEmployer(userId, input.employerId);

  // Проверяем дубликаты order в subTasks
  if (input.subTasks && input.subTasks.length > 0) {
    const orders = input.subTasks.map((st) => st.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
      throw new TaskError(
        'VALIDATION_ERROR',
        'Дубликат order в subTasks',
        'subTasks',
        'not_unique'
      );
    }
  }

  const status = input.status ?? 'progress';
  const priority = input.priority ?? 'medium';

  try {
    const task = await prisma.task.create({
      data: {
        id: generateId(),
        userId,
        employerId: input.employerId ?? null,
        title: input.title,
        currency: input.currency ?? 'RUB',
        priority,
        priorityWeight: PRIORITY_WEIGHT[priority],
        status,
        statusWeight: STATUS_WEIGHT[status],
        description: input.description ?? null,
        payment: input.payment ?? 0,
        deadline: input.deadline ? new Date(input.deadline) : null,
        subTasks: input.subTasks
          ? {
              create: input.subTasks.map((st) => ({
                id: generateId(),
                order: st.order,
                isComplete: st.isComplete ?? false,
                text: st.text,
              })),
            }
          : undefined,
      },
      include: {
        subTasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return toTaskResponse(task, true);
  } catch (error: any) {
    // Prisma P2002 — нарушение уникальности (order в пределах задачи)
    if (error.code === 'P2002') {
      throw new TaskError(
        'VALIDATION_ERROR',
        'Дубликат order в subTasks',
        'subTasks',
        'not_unique'
      );
    }
    throw error;
  }
}

// === Обновление ===

export async function update(
  userId: string,
  id: string,
  input: UpdateTaskInput
) {
  // Проверяем, что задача существует и принадлежит пользователю
  const existing = await prisma.task.findFirst({
    where: { id, userId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    throw new TaskError('NOT_FOUND', 'Задача не найдена');
  }

  // Проверяем employerId (если передан и не null)
  if (input.employerId !== undefined) {
    await validateEmployer(userId, input.employerId);
  }

  // Собираем данные для обновления: только переданные поля
  const data: any = {};
  if (input.employerId !== undefined) data.employerId = input.employerId;
  if (input.title !== undefined) data.title = input.title;
  if (input.currency !== undefined) data.currency = input.currency;
  if (input.description !== undefined) data.description = input.description;
  if (input.payment !== undefined) data.payment = input.payment;
  if (input.deadline !== undefined) {
    data.deadline = input.deadline ? new Date(input.deadline) : null;
  }
  if (input.status !== undefined) {
    data.status = input.status;
    data.statusWeight = STATUS_WEIGHT[input.status];
  }
  if (input.priority !== undefined) {
    data.priority = input.priority;
    data.priorityWeight = PRIORITY_WEIGHT[input.priority];
  }

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      subTasks: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return toTaskResponse(task, true);
}

// === Мягкое удаление ===

export async function remove(userId: string, id: string) {
  const existing = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true, deletedAt: true },
  });

  if (!existing) {
    throw new TaskError('NOT_FOUND', 'Задача не найдена');
  }

  // Если уже удалена — идемпотентно
  if (existing.deletedAt) {
    return;
  }

  await prisma.task.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

// === Вспомогательные ===

async function validateEmployer(
  userId: string,
  employerId: string | null | undefined
) {
  if (employerId === undefined || employerId === null) return;

  const employer = await prisma.employer.findFirst({
    where: {
      id: employerId,
      userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!employer) {
    throw new TaskError(
      'VALIDATION_ERROR',
      'Заказчик не найден',
      'employerId',
      'not_found'
    );
  }
}

function parseSort(sort?: string): any {
  switch (sort) {
    case 'deadline':
      return [{ deadline: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }];
    case '-deadline':
      return [{ deadline: { sort: 'desc', nulls: 'last' } }, { createdAt: 'asc' }];
    case 'createdAt':
      return { createdAt: 'asc' };
    case '-createdAt':
      return { createdAt: 'desc' };
    case 'priority':
      return [{ priorityWeight: 'desc' }, { createdAt: 'asc' }]; // high → medium → low
    case '-priority':
      return [{ priorityWeight: 'asc' }, { createdAt: 'asc' }];  // low → medium → high
    case undefined:
      // По умолчанию: незавершённые вверху, внутри — по дедлайну
      return [
        { statusWeight: 'asc' },  // progress → review → done → paid
        { deadline: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'asc' },
      ];
    default:
      return { createdAt: 'desc' };
  }
}

function toTaskResponse(
  task: TaskWithSubTasks,
  includeSubTasks: boolean
): TaskResponse {
  const response: TaskResponse = {
    id: task.id,
    employerId: task.employerId,
    title: task.title,
    currency: task.currency,
    priority: task.priority,
    status: task.status,
    description: task.description,
    payment: task.payment,
    deadline: task.deadline ? formatDate(task.deadline) : null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    deletedAt: task.deletedAt,
  };

  if (includeSubTasks) {
    response.subTasks = task.subTasks.map((st) => ({
      id: st.id,
      order: st.order,
      isComplete: st.isComplete,
      text: st.text,
      createdAt: st.createdAt,
    }));
  }

  return response;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}