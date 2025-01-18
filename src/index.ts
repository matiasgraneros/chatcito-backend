import './config/config';
import express from 'express';
import cors from 'cors';
import { routerApi } from './routes';

const app = express();
const PORT = process.env.PORT;

const corsOptions = {
  origin: ['http://localhost:5173'],
  methods: ['POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
routerApi(app);

app
  .listen(PORT, () => {
    console.log('Server running at PORT: ', PORT);
  })
  .on('error', (error) => {
    throw new Error(error.message);
  });
