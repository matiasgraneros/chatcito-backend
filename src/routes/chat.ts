import express from 'express';
import { deleteChat, sendMessage } from '../controllers/chat.controller';
import { validateSchema } from '../middlewares/validateSchema';
import { chatIdSchema, userMessageSchema } from '../schemas/chat.schemas';

const router = express.Router();

router.post('/', validateSchema(userMessageSchema), sendMessage);
router.delete('/', validateSchema(chatIdSchema), deleteChat);

export default router;
