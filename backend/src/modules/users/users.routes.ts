import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as usersController from './users.controller';

const router = Router();

router.use(authMiddleware);

router.get('/me', usersController.getMe);
router.patch('/me', usersController.updateMe);
router.patch('/me/preferences', usersController.updatePreferences);

export default router;