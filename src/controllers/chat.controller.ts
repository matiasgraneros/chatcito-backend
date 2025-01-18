import { NextFunction, Request, Response } from 'express';
import {
  handleDeleteChat,
  handleExistingChat,
  handleNewChat,
} from '../services/chat.service';

export async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userMessage, chatId } = req.body;

    let response;

    if (chatId) {
      response = await handleExistingChat(userMessage, chatId);
    } else {
      response = await handleNewChat(userMessage);
    }

    res.status(200).json(response);
    return;
  } catch (error) {
    if (error instanceof Error && error.message === 'Chat has expired') {
      res.status(410).json({ message: error.message });
      return;
    }
    if (error instanceof Error && error.message === 'Chat limit reached') {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
}
export async function deleteChat(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { chatId } = req.body;

    const chatDeleted = await handleDeleteChat(chatId);

    res.status(200).json(chatDeleted);
    return;
  } catch (error) {
    next(error);
  }
}
