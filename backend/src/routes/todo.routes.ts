import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import * as todoController from '../controllers/todo.controller';

const router = Router();

router.use(authenticate);

router.get('/', todoController.getAll);
router.post('/', todoController.create);
router.patch('/:id', todoController.update);
router.delete('/:id', todoController.remove);
router.patch('/:id/complete', todoController.complete);
router.patch('/:id/revert', todoController.revert);

export default router;
