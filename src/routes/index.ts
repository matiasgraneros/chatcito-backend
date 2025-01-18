import { Application } from 'express';
import { errorHandler } from '../middlewares/errorHandler';
import chatRouter from './chat';

export function routerApi(app: Application) {
  app.use('/chat', chatRouter);

  app.use(errorHandler);
}
