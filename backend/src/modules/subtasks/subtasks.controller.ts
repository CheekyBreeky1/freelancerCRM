import { Request, Response, NextFunction } from 'express';
import * as subtasksService from './subtasks.service';

// === Список ===

export async function list(
  req: Request<{ taskId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const { taskId } = req.params;

    const subtasks = await subtasksService.list(userId, taskId);
    res.status(200).json(subtasks);
  } catch (error) {
    next(error);
  }
}

// === Создание ===

export async function create(
  req: Request<{ taskId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const { taskId } = req.params;
    const input = req.body;

    const subtask = await subtasksService.create(userId, taskId, input);
    res.status(201).json(subtask);
  } catch (error) {
    next(error);
  }
}

// === Обновление ===

export async function update(
  req: Request<{ taskId: string; subtaskId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const { taskId, subtaskId } = req.params;
    const input = req.body;

    const subtask = await subtasksService.update(userId, taskId, subtaskId, input);
    res.status(200).json(subtask);
  } catch (error) {
    next(error);
  }
}

// === Удаление ===

export async function remove(
  req: Request<{ taskId: string; subtaskId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const { taskId, subtaskId } = req.params;

    await subtasksService.remove(userId, taskId, subtaskId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}