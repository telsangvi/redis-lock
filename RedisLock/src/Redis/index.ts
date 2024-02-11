import Redis, { Cluster } from 'ioredis';

/**
 * Service class for managing the connection to a Redis cluster using the ioredis library.
 */
class RedisService {
  private redisClient: Cluster;

  /**
   * Initializes the RedisService and establishes a connection to the Redis cluster.
   */
  constructor() {
    console.info('Redis initialized');

    // Creating a Redis Cluster client instance with provided configuration options
    this.redisClient = new Redis.Cluster(
      [
        {
          host: process?.env?.REDIS_HOST,
          port: Number(process?.env?.REDIS_PORT),
        },
      ],
      {
        redisOptions: {
          maxRetriesPerRequest: 1,
          password: process?.env?.REDIS_PASSWORD,
          tls: {
            servername: process?.env?.REDIS_SERVER_NAME,
          },
        },
        clusterRetryStrategy(times: any) {
          // Custom retry strategy: Retry once with a delay of 200 milliseconds
          if (times >= 2) {
            return null; // Return null to stop retrying after two attempts
          }
          return 200; // Delay in milliseconds before the next retry
        },
      }
    );

    // Event listeners for various Redis connection events
    this.redisClient.on('connect', () => {
      console.info('Redis cluster connected');
    });

    this.redisClient.on('close', async () => {
      console.info('Redis cluster connection closed');

      // Reconnect logic with a 10-second delay
      setTimeout(() => {
        this.redisClient
          .connect()
          .catch((error: any) => {
            console.error('Redis retry connection failed', error);
          })
          .then(() => {
            console.info('Redis retry connection success');
          });
      }, 10000);
    });

    this.redisClient.on('error', (err: any) => {
      console.error('Redis cluster connection error', err);
    });

    this.redisClient.on('connecting', () => {
      console.info('Redis cluster connecting');
    });

    this.redisClient.on('ready', () => {
      console.info('Redis cluster connection ready');
    });

    this.redisClient.on('reconnecting', () => {
      console.info('Redis cluster reconnecting');
    });
  }

  /**
   * Get the Redis Cluster client instance.
   * @returns The Redis Cluster client instance.
   */
  getRedisConnectionInstance() {
    return this.redisClient;
  }
}

// Exporting an instance of the RedisService to be used across the application
export default new RedisService();
