import Redlock, { ResourceLockedError, ExecutionError } from 'redlock'

import redis from '.'

export class RedisLockService {
  private redlock: any

  constructor() {
    this.redlock = new Redlock(
      // You should have one client for each independent redis node
      // or cluster.
      [redis.getRedisConnectionInstance()],
      {
        // The expected clock drift; for more details see:
        // http://redis.io/topics/distlock
        driftFactor: 0.01, // multiplied by lock ttl to determine drift time

        // The max number of times Redlock will attempt to lock a resource
        // before erroring.
        retryCount: 0,

        // the time in ms between attempts
        retryDelay: 200, // time in ms

        // the max time in ms randomly added to retries
        // to improve performance under high contention
        // see https://www.awsarchitectureblog.com/2015/03/backoff.html
        retryJitter: 200, // time in ms

        // The minimum remaining time on a lock before an extension is automatically
        // attempted with the `using` API.
        automaticExtensionThreshold: 500, // time in ms
      }
    )
    this.redlock.on('error', (err:any) => {
      if (err instanceof ResourceLockedError) {
        console.error('Request already in process', err)
      } else if (err instanceof ExecutionError) {
        console.error('Redis client not reachable', err)
      } else {
        console.error('Redis lock error occurred', err)
      }
      this.redlock['err'] = err
    })
  }

  getRedLockInstance() {
    return this.redlock
  }
}
