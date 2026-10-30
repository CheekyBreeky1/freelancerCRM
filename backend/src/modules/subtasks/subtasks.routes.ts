import { Router } from 'express';
import * as subtasksController from './subtasks.controller';

const router = Router({ mergeParams: true });

router.get('/', subtasksController.list);
router.post('/', subtasksController.create);
router.patch('/:subtaskId', subtasksController.update);
router.delete('/:subtaskId', subtasksController.remove);

export default router;