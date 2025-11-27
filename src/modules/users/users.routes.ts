import express from 'express';
import * as usersController from './users.controller';
import { protect, restrictTo } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/', usersController.getAllUsers);
router.post('/', usersController.createUser);
router.patch('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

export default router;
