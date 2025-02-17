import mongoose from 'mongoose';
import Locals from './Locals';
import Logger from '@/utils/logger';
import { createClient, RedisClientType } from 'redis';
import MongoStore from 'connect-mongo';
import { RedisStore } from 'connect-redis';
import { ConnectionOptions } from 'bullmq';

const REDIS_SERVICES = ['SESSION', 'CACHE', 'QUEUE'] as const;
type RedisServiceType = (typeof REDIS_SERVICES)[number];
export class Database {
  private static redisClients: Partial<Record<RedisServiceType, RedisClientType>> = {};
  public static init(): void {
    this.mongoConnect();
    this.redisConnect();
  }

  // MongoDB session store
  public static getMongoStore(): MongoStore {
    return MongoStore.create({
      mongoUrl: Locals.config().MONGOOSE_URL,
      collectionName: 'sessions',
    });
  }

  // MongoDB connection
  private static async mongoConnect(): Promise<void> {
    try {
      await mongoose.connect(Locals.config().MONGOOSE_URL, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: true,
      });
      Logger.info('Connection Established to the Mongo server!!');
    } catch (error) {
      Logger.error('Failed to connect to the Mongo server!!');
      console.error(error);
      throw error;
    }
  }

  // Redis session store
  public static getRedisSessionStore(): RedisStore {
    const client = this.getRedisClient('SESSION');
    return new RedisStore({ client, prefix: Locals.config().REDIS_SESSION_PREFIX });
  }

  // Redis queue Options
  public static getRedisOptions(service: RedisServiceType): ConnectionOptions {
    return {
      host: Locals.config().REDIS_HOST,
      port: Locals.config().REDIS_PORT,
      password: Locals.config().REDIS_PASSWORD,
      db: Locals.config()[`REDIS_${service}_DB`],
    };
  }

  // Redis cache connection
  private static async redisConnect(): Promise<void> {
    await Promise.all(
      REDIS_SERVICES.map(async (service) => {
        const client = this.getRedisClient(service);
        await client.connect();
      }),
    );
  }

  public static getRedisClient(service: RedisServiceType): RedisClientType {
    if (!this.redisClients[service]) {
      const DatabaseKey = `REDIS_${service}_DB` as const;
      if (!Locals.config()[DatabaseKey]) {
        Logger.warn(`⚠️ Redis database key is missing for service: REDIS_${service}_DB`);
      }

      this.redisClients[service] = createClient({
        url: Locals.config().REDIS_URL,
        password: Locals.config().REDIS_PASSWORD,
        database: Locals.config()[DatabaseKey],
      });

      this.redisClients[service]!.on('error', (error) => {
        Logger.error(`❌ Redis ${service} Client Error`, error);
      });

      this.redisClients[service]!.on('connect', () => {
        // Logger.info(`✅ Redis ${service} Client Connected`);
      });
    }
    return this.redisClients[service]!;
  }
}

export default Database;
