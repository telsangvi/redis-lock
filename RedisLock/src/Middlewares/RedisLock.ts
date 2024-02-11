import { NextFunction, Request, Response } from 'express';
import Redlock, { ResourceLockedError, ExecutionError } from 'redlock';
import { RedisLockService } from '../Redis/lock';

/**
 * Middleware to acquire a Redis lock before executing a callback function.
 * @param callback - The callback function to execute if the lock is acquired.
 * @param key - A string identifier for the lock key.
 */
export const redisLockMiddleware = (callback: any, key: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let lock: any;
    let redlockInstance: any;
    const lockKey = getLockKey(req, key);

    console.debug('Redis lock request for key', lockKey);

    try {
      // Creating an instance of the RedisLockService to get the Redlock instance
      const redisLockInstance = new RedisLockService();
      redlockInstance = redisLockInstance.getRedLockInstance();

      // Acquiring the lock for a specific key with a timeout of 20 seconds (20000 milliseconds)
      lock = await redlockInstance.acquire([lockKey], 20000);

      if (lock) {
        console.debug('Redis lock acquired successfully for key', lockKey);

        // If the lock is acquired, execute the provided callback function
        await callback(req, res, next);
      }
    } catch (err) {
      // Handling errors that might occur during lock acquisition

      if (redlockInstance['err'] instanceof ExecutionError) {
        console.error('Error occurred while lock acquire - ExecutionError', redlockInstance['err']);
        return true;
      } else if (redlockInstance['err'] instanceof ResourceLockedError) {
        console.error('Error occurred while lock acquire - ResourceLockedError', redlockInstance['err']);
        return true;
      } else {
        if (err instanceof ExecutionError) {
          console.error('Error occurred while lock acquire - ExecutionError', redlockInstance['err']);
          return true;
        }

        console.error(`Error occurred while execution of ${callback}`, err);
        throw err; // Re-throwing the error to be caught by the higher-level error handler
      }
    } finally {
      // Cleanup code that will always be executed, whether an error occurred or not

      try {
        if (lock) {
          console.debug('Redis lock releasing for key', lockKey);

          // Releasing the acquired lock
          await lock.release();
        }
      } catch (err) {
        console.error('Error occurred while lock release', err);
      }
    }
  };
};

/**
 * Generates a lock key based on the request, a string identifier, and a resolved dynamic property path.
 * @param req - The Express Request object.
 * @param key - A string identifier for the lock key.
 * @returns The generated lock key.
 */
function getLockKey(req: Request, key: string) {
  return req.baseUrl + req.url + '-' + resolve(req, key);
}

/**
 * Resolves a dynamic property path on an object.
 * @param obj - The object to resolve the property path on.
 * @param path - The property path to resolve.
 * @returns The resolved value of the property path.
 */
function resolve(obj: any, path: any) {
  return path.split('.').reduce(function (prev: any, curr: any) {
    return prev ? prev[curr] : null;
  }, obj);
}
