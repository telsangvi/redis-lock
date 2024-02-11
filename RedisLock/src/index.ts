// src/index.ts
import express, { Request, Response } from 'express';
import { redisLockMiddleware } from './Middlewares/RedisLock';

const app = express();
const port = 3000;

/* For this particular API request, 
you wish to acquire lock for the perticular user-id present in req headers.
This will help to prevent simultaneous create/update requests if they are unintended
*/
app.get('/',redisLockMiddleware((req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
},'headers.user-id'));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
