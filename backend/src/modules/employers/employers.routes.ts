import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as employersController from './employers.controller';

const router = Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

router.get('/', employersController.list);
router.post('/', employersController.create);
router.get('/:id', employersController.getById);
router.patch('/:id', employersController.update);
router.delete('/:id', employersController.remove);

export default router;