import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createExpenseSchema, updateExpenseSchema } from '../../validators/expense.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as expenseController from '../../controllers/expense.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.EXPENSES_MANAGE),
  validate({ body: createExpenseSchema }),
  expenseController.createExpense
);
router.get('/', authorize(PERMISSIONS.EXPENSES_READ), expenseController.listExpenses);
router.get('/:id', authorize(PERMISSIONS.EXPENSES_READ), expenseController.getExpense);
router.patch(
  '/:id',
  authorize(PERMISSIONS.EXPENSES_MANAGE),
  validate({ body: updateExpenseSchema }),
  expenseController.updateExpense
);
router.delete('/:id', authorize(PERMISSIONS.EXPENSES_MANAGE), expenseController.deleteExpense);

export default router;
