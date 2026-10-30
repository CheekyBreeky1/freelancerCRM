import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service';

// === GET /users/me ===

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;

    const user = await usersService.getMe(userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// === PATCH /users/me ===

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const input = req.body;

    const user = await usersService.updateMe(userId, input);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// === PATCH /users/me/preferences ===

export async function updatePreferences(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const input = req.body;

    const preferences = await usersService.updatePreferences(userId, input);
    res.status(200).json(preferences);
  } catch (error) {
    next(error);
  }
}