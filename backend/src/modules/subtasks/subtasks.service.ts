import { prisma } from '../../db/prisma';
import { generateId } from '../../utils/id';
import type { SubTask } from '../../generated/prisma/client';

// === Типы ===

export type CreateSubTaskInput = {
  order: number;
  isComplete?: boolean;
  text: string;
};

export type UpdateSubTaskInput = {
  order?: number;
  isComplete?: boolean;
  text?: string;
};

export type SubTaskResponse = {
  id: string;
  order: number;
  isComplete: boolean;
  text: string;
  createdAt: Date;
};

// === Кастомная ошибка ===

export class SubTaskError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'VALIDATION_ERROR',
    message: string,
    public field?: string,
    public reason?: string
  ) {
    super(message);
    this.name = 'SubTaskError';
  }
}

// === Список ===

export async function list(userId: string, taskId: string) {
  await validateTask(userId, taskId);

  const subtasks = await prisma.subTask.findMany({
    where: { taskId },
    orderBy: { order: 'asc' },
  });

  return subtasks.map(toSubTaskResponse);
}

// === Создание ===

export async function create(
  userId: string,
  taskId: string,
  input: CreateSubTaskInput
) {
  await validateTask(userId, taskId);

  try {
    const subtask = await prisma.subTask.create({
      data: {
        id: generateId(),
        taskId,
        order: input.order,
        isComplete: input.isComplete ?? false,
        text: input.text,
      },
    });

    return toSubTaskResponse(subtask);
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new SubTaskError(
        'VALIDATION_ERROR',
        'order уже занят в этой задаче',
        'order',
        'not_unique'
      );
    }
    throw error;
  }
}

// === Обновление ===

export async function update(
  userId: string,
  taskId: string,
  subtaskId: string,
  input: UpdateSubTaskInput
) {
  await validateTask(userId, taskId);
  await validateSubTask(taskId, subtaskId);

  // Собираем данные: только переданные поля
  const data: any = {};
  if (input.order !== undefined) data.order = input.order;
  if (input.isComplete !== undefined) data.isComplete = input.isComplete;
  if (input.text !== undefined) data.text = input.text;

  try {
    const subtask = await prisma.subTask.update({
      where: { id: subtaskId },
      data,
    });

    return toSubTaskResponse(subtask);
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new SubTaskError(
        'VALIDATION_ERROR',
        'order уже занят в этой задаче',
        'order',
        'not_unique'
      );
    }
    throw error;
  }
}

// === Жёсткое удаление ===

export async function remove(
  userId: string,
  taskId: string,
  subtaskId: string
) {
  await validateTask(userId, taskId);
  await validateSubTask(taskId, subtaskId);

  await prisma.subTask.delete({
    where: { id: subtaskId },
  });
}

// === Вспомогательные ===

async function validateTask(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!task) {
    throw new SubTaskError('NOT_FOUND', 'Задача не найдена');
  }
}

async function validateSubTask(taskId: string, subtaskId: string) {
  const subtask = await prisma.subTask.findFirst({
    where: {
      id: subtaskId,
      taskId,
    },
    select: { id: true },
  });

  if (!subtask) {
    throw new SubTaskError('NOT_FOUND', 'Подпункт не найден');
  }
}

function toSubTaskResponse(subtask: SubTask): SubTaskResponse {
  return {
    id: subtask.id,
    order: subtask.order,
    isComplete: subtask.isComplete,
    text: subtask.text,
    createdAt: subtask.createdAt,
  };
}