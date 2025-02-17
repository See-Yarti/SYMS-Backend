import { RedisClientType } from 'redis';
import Logger from '@/utils/logger';
import Database from './Database';
import Locals from './Locals';

class Cache {
  private static cacheClient: RedisClientType = Database.getRedisClient('CACHE');
  private static cachePrefix = Locals.config().REDIS_CACHE_PREFIX;

  /**
   * Generate a prefixed key to avoid collisions
   * @param key - The raw key
   * @returns The prefixed key
   */
  private static getPrefixedKey(key: string): string {
    return `${this.cachePrefix}${key}`;
  }

  /**
   * Set a value in the cache
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Time to live in seconds
   */
  public static async set(key: string, value: any, ttl: number = Locals.config().REDIS_TTL): Promise<void> {
    try {
      const cacheKey = this.getPrefixedKey(key);
      const cacheValue = JSON.stringify(value);
      await this.cacheClient.set(cacheKey, cacheValue, { EX: ttl });
    } catch (error) {
      Logger.error('❌ Cache Error', error);
      throw new Error('Error setting cache');
    }
  }

  /**
   * Get a value from the cache
   * @param key - The cache key
   * @returns The cached value or null if not found
   */
  public static async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.getPrefixedKey(key);
      const value = await this.cacheClient.get(cacheKey);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      Logger.error(`❌ Error getting cache for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Delete a value from the cache
   * @param key - The cache key
   */
  public static async delete(key: string): Promise<void> {
    try {
      const cacheKey = this.getPrefixedKey(key);
      await this.cacheClient.del(cacheKey);
      Logger.info(`🗑️ Cache deleted for key: ${key}`);
    } catch (error) {
      Logger.error(`❌ Error deleting cache for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists in the cache
   * @param key - The cache key
   * @returns True if the key exists, otherwise false
   */
  public static async exists(key: string): Promise<boolean> {
    try {
      const cacheKey = this.getPrefixedKey(key);
      const result = await this.cacheClient.exists(cacheKey);
      return result > 0;
    } catch (error) {
      Logger.error(`❌ Error checking cache existence for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Clear all cache keys with the specific prefix
   */
  public static async clearAll(): Promise<void> {
    try {
      const pattern = `${this.cachePrefix}*`;
      const keys = await this.cacheClient.keys(pattern);
      if (keys.length > 0) {
        await this.cacheClient.del(keys);
        Logger.info(`🗑️ Cleared ${keys.length} cache keys`);
      }
    } catch (error) {
      Logger.error('❌ Error clearing cache', error);
      throw error;
    }
  }
}

export default Cache;
