# RedisLock

RedisLock is a Node.js library that provides middleware for acquiring and releasing distributed locks using Redis. It utilizes the `ioredis` library and `redlock` algorithm to ensure a reliable and distributed lock management system.

## Prerequisites

Before using RedisLock, ensure you have the following prerequisites:

1. **Redis Cluster Setup:**
   - Set up a Redis Cluster to handle distributed lock management.
   - Refer to the [official Redis documentation](https://redis.io/topics/cluster-tutorial) for guidance on setting up a Redis Cluster.

2. **Environment Variables:**
   - Maintain the Redis Cluster credentials in your environment file (e.g., `.env`):
     ```plaintext
     REDIS_HOST=your_redis_host
     REDIS_PORT=your_redis_port
     REDIS_PASSWORD=your_redis_password
     REDIS_SERVER_NAME=your_redis_server_name
     ```

## Installation

```bash
npm install
