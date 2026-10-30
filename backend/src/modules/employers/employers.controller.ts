import { Request, Response, NextFunction } from 'express';
import * as employersService from './employers.service';

// === Список ===

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;

    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const sort = req.query.sort as string | undefined;

    // Собираем все ошибки валидации
    const details: Array<{ field: string; reason: string }> = [];

    if (status !== undefined) {
      const validStatuses = ['new', 'active', 'archived'];
      if (typeof status !== 'string' || !validStatuses.includes(status)) {
        details.push({ field: 'status', reason: 'invalid_value' });
      }
    }

    if (sort !== undefined) {
      const validSorts = ['name', '-name', 'createdAt', '-createdAt'];
      if (typeof sort !== 'string' || !validSorts.includes(sort)) {
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

    const result = await employersService.list(userId, {
      status: status as any,
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

    const employer = await employersService.getById(userId, id);
    res.status(200).json(employer);
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

    const employer = await employersService.create(userId, input);

    res
      .status(201)
      .setHeader('Location', `/api/v1/employers/${employer.id}`)
      .json(employer);
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

    const employer = await employersService.update(userId, id, input);
    res.status(200).json(employer);
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

    await employersService.remove(userId, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}