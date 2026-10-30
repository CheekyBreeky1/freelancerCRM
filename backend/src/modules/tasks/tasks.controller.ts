import { Request, Response, NextFunction } from 'express';
import * as tasksService from './tasks.service';

// === Список ===

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;

    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const employerId = req.query.employerId as string | undefined;
    const search = req.query.search as string | undefined;
    const sort = req.query.sort as string | undefined;

    // Собираем все ошибки валидации
    const details: Array<{ field: string; reason: string }> = [];

    if (status !== undefined) {
      const valid = ['progress', 'review', 'done', 'paid'];
      if (typeof status !== 'string' || !valid.includes(status)) {
        details.push({ field: 'status', reason: 'invalid_value' });
      }
    }

    if (priority !== undefined) {
      const valid = ['low', 'medium', 'high'];
      if (typeof priority !== 'string' || !valid.includes(priority)) {
        details.push({ field: 'priority', reason: 'invalid_value' });
      }
    }

    if (sort !== undefined) {
      const valid = [
        'deadline',
        '-deadline',
        'createdAt',
        '-createdAt',
        'priority',
        '-priority',
      ];
      if (typeof sort !== 'string' || !valid.includes(sort)) {
        details.push({ field: 'sort', reason: 'invalid_value' });
      }
    }

    if (details.length > 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Невалидные данные',
          details,
        },
      });
    }

    const result = await tasksService.list(userId, {
      status: status as any,
      priority: priority as any,
      employerId,
      search,
      sort: sort as any,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// === Один по ID ===

export async function getById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const task = await tasksService.getById(userId, id);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
}

// === Создание ===

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const input = req.body;

    const task = await tasksService.create(userId, input);

    res
      .status(201)
      .setHeader('Location', `/api/v1/tasks/${task.id}`)
      .json(task);
  } catch (error) {
    next(error);
  }
}

// === Обновление ===

export async function update(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const input = req.body;

    const task = await tasksService.update(userId, id, input);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
}

// === Удаление ===

export async function remove(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await tasksService.remove(userId, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}