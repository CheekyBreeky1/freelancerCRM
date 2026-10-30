import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as tasksController from './tasks.controller';
import subtasksRoutes from '../subtasks/subtasks.routes';

const router = Router();

router.use(authMiddleware);

router.get('/', tasksController.list);
router.post('/', tasksController.create);
router.get('/:id', tasksController.getById);
router.patch('/:id', tasksController.update);
router.delete('/:id', tasksController.remove);

// Вложенные подпункты
router.use('/:taskId/subtasks', subtasksRoutes);

export default router;