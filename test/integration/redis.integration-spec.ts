import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import redisConfig from '../../src/config/redis.config';

/**
 * Redis Integration Tests
 *
 * These tests validate:
 * - Redis connection
 * - Cache operations (get, set, delete)
 * - TTL and expiration
 * - Key patterns and namespacing
 * - Data serialization
 */
describe('Redis Integration', () => {
  let module: TestingModule;
  let redis: Redis;
  const TEST_PREFIX = 'test:';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [redisConfig],
        }),
        RedisModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'single',
            options: {
              host: configService.get<string>('redis.host', 'localhost'),
              port: configService.get<number>('redis.port', 6380),
              password: configService.get<string>('redis.password'),
              db: configService.get<number>('redis.db', 0),
              keyPrefix: configService.get<string>('redis.keyPrefix', 'sigp:'),
            },
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    redis = module.get<Redis>(Redis);
  });

  afterAll(async () => {
    // Cleanup test keys
    const keys = await redis.keys(`${TEST_PREFIX}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    await redis.quit();
    await module.close();
  });

  afterEach(async () => {
    // Cleanup after each test
    const keys = await redis.keys(`${TEST_PREFIX}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  });

  describe('Connection', () => {
    it('should connect to Redis', () => {
      expect(redis.status).toBe('ready');
    });

    it('should ping Redis', async () => {
      const result = await redis.ping();
      expect(result).toBe('PONG');
    });

    it('should have correct db selected', async () => {
      const config = redis.options;
      expect(config.db).toBeDefined();
    });
  });

  describe('Basic Operations', () => {
    it('should set and get a string value', async () => {
      const key = `${TEST_PREFIX}string`;
      const value = 'test-value';

      await redis.set(key, value);
      const result = await redis.get(key);

      expect(result).toBe(value);
    });

    it('should set and get a JSON object', async () => {
      const key = `${TEST_PREFIX}json`;
      const value = { name: 'Test', id: 1, active: true };

      await redis.set(key, JSON.stringify(value));
      const result = await redis.get(key);
      const parsed = JSON.parse(result!);

      expect(parsed).toEqual(value);
    });

    it('should delete a key', async () => {
      const key = `${TEST_PREFIX}delete`;
      await redis.set(key, 'to-delete');

      const deleted = await redis.del(key);
      expect(deleted).toBe(1);

      const result = await redis.get(key);
      expect(result).toBeNull();
    });

    it('should check if key exists', async () => {
      const key = `${TEST_PREFIX}exists`;
      await redis.set(key, 'value');

      const exists = await redis.exists(key);
      expect(exists).toBe(1);

      await redis.del(key);
      const notExists = await redis.exists(key);
      expect(notExists).toBe(0);
    });
  });

  describe('TTL and Expiration', () => {
    it('should set a key with TTL', async () => {
      const key = `${TEST_PREFIX}ttl`;
      const value = 'expires';
      const ttlSeconds = 5;

      await redis.setex(key, ttlSeconds, value);
      const ttl = await redis.ttl(key);

      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(ttlSeconds);
    });

    it('should expire a key after TTL', async () => {
      const key = `${TEST_PREFIX}expire`;
      const value = 'will-expire';
      const ttlSeconds = 1;

      await redis.setex(key, ttlSeconds, value);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = await redis.get(key);
      expect(result).toBeNull();
    });

    it('should update TTL on existing key', async () => {
      const key = `${TEST_PREFIX}update-ttl`;
      await redis.set(key, 'value');

      await redis.expire(key, 10);
      const ttl = await redis.ttl(key);

      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(10);
    });

    it('should persist a key (remove TTL)', async () => {
      const key = `${TEST_PREFIX}persist`;
      await redis.setex(key, 10, 'value');

      await redis.persist(key);
      const ttl = await redis.ttl(key);

      expect(ttl).toBe(-1); // -1 means no expiration
    });
  });

  describe('Hash Operations', () => {
    it('should set and get hash fields', async () => {
      const key = `${TEST_PREFIX}hash`;
      const fields = {
        name: 'John',
        age: '30',
        email: 'john@example.com',
      };

      await redis.hset(key, fields);
      const result = await redis.hgetall(key);

      expect(result).toEqual(fields);
    });

    it('should get specific hash field', async () => {
      const key = `${TEST_PREFIX}hash-field`;
      await redis.hset(key, { name: 'Jane', age: '25' });

      const name = await redis.hget(key, 'name');
      expect(name).toBe('Jane');
    });

    it('should delete hash field', async () => {
      const key = `${TEST_PREFIX}hash-del`;
      await redis.hset(key, { name: 'Delete', age: '40' });

      await redis.hdel(key, 'age');
      const result = await redis.hgetall(key);

      expect(result).toEqual({ name: 'Delete' });
    });

    it('should check if hash field exists', async () => {
      const key = `${TEST_PREFIX}hash-exists`;
      await redis.hset(key, { field1: 'value1' });

      const exists = await redis.hexists(key, 'field1');
      expect(exists).toBe(1);

      const notExists = await redis.hexists(key, 'field2');
      expect(notExists).toBe(0);
    });
  });

  describe('List Operations', () => {
    it('should push and pop from list', async () => {
      const key = `${TEST_PREFIX}list`;

      await redis.rpush(key, 'item1', 'item2', 'item3');
      const length = await redis.llen(key);
      expect(length).toBe(3);

      const popped = await redis.lpop(key);
      expect(popped).toBe('item1');
    });

    it('should get list range', async () => {
      const key = `${TEST_PREFIX}list-range`;
      await redis.rpush(key, 'a', 'b', 'c', 'd', 'e');

      const range = await redis.lrange(key, 0, 2);
      expect(range).toEqual(['a', 'b', 'c']);
    });

    it('should trim list', async () => {
      const key = `${TEST_PREFIX}list-trim`;
      await redis.rpush(key, '1', '2', '3', '4', '5');

      await redis.ltrim(key, 0, 2);
      const result = await redis.lrange(key, 0, -1);

      expect(result).toEqual(['1', '2', '3']);
    });
  });

  describe('Set Operations', () => {
    it('should add and check members in set', async () => {
      const key = `${TEST_PREFIX}set`;

      await redis.sadd(key, 'member1', 'member2', 'member3');
      const isMember = await redis.sismember(key, 'member1');
      expect(isMember).toBe(1);

      const notMember = await redis.sismember(key, 'member4');
      expect(notMember).toBe(0);
    });

    it('should get all set members', async () => {
      const key = `${TEST_PREFIX}set-members`;
      await redis.sadd(key, 'a', 'b', 'c');

      const members = await redis.smembers(key);
      expect(members.sort()).toEqual(['a', 'b', 'c'].sort());
    });

    it('should remove member from set', async () => {
      const key = `${TEST_PREFIX}set-remove`;
      await redis.sadd(key, 'keep', 'remove');

      await redis.srem(key, 'remove');
      const members = await redis.smembers(key);

      expect(members).toEqual(['keep']);
    });
  });

  describe('Sorted Set Operations', () => {
    it('should add and get sorted set members', async () => {
      const key = `${TEST_PREFIX}zset`;

      await redis.zadd(key, 1, 'first', 2, 'second', 3, 'third');
      const range = await redis.zrange(key, 0, -1);

      expect(range).toEqual(['first', 'second', 'third']);
    });

    it('should get sorted set range with scores', async () => {
      const key = `${TEST_PREFIX}zset-scores`;
      await redis.zadd(key, 10, 'low', 20, 'medium', 30, 'high');

      const range = await redis.zrange(key, 0, -1, 'WITHSCORES');

      expect(range).toEqual(['low', '10', 'medium', '20', 'high', '30']);
    });

    it('should get sorted set rank', async () => {
      const key = `${TEST_PREFIX}zset-rank`;
      await redis.zadd(key, 1, 'a', 2, 'b', 3, 'c');

      const rank = await redis.zrank(key, 'b');
      expect(rank).toBe(1); // 0-indexed
    });
  });

  describe('Pattern Matching', () => {
    it('should find keys by pattern', async () => {
      await redis.set(`${TEST_PREFIX}pattern:1`, 'value1');
      await redis.set(`${TEST_PREFIX}pattern:2`, 'value2');
      await redis.set(`${TEST_PREFIX}pattern:3`, 'value3');

      const keys = await redis.keys(`${TEST_PREFIX}pattern:*`);
      expect(keys.length).toBe(3);
    });

    it('should scan keys', async () => {
      await redis.set(`${TEST_PREFIX}scan:1`, 'v1');
      await redis.set(`${TEST_PREFIX}scan:2`, 'v2');

      const [cursor, keys] = await redis.scan(
        0,
        'MATCH',
        `${TEST_PREFIX}scan:*`,
        'COUNT',
        100,
      );

      expect(keys.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Increment/Decrement', () => {
    it('should increment a counter', async () => {
      const key = `${TEST_PREFIX}counter`;

      await redis.set(key, '0');
      await redis.incr(key);
      await redis.incr(key);

      const result = await redis.get(key);
      expect(result).toBe('2');
    });

    it('should increment by specific amount', async () => {
      const key = `${TEST_PREFIX}counter-by`;

      await redis.set(key, '10');
      await redis.incrby(key, 5);

      const result = await redis.get(key);
      expect(result).toBe('15');
    });

    it('should decrement a counter', async () => {
      const key = `${TEST_PREFIX}decrement`;

      await redis.set(key, '10');
      await redis.decr(key);

      const result = await redis.get(key);
      expect(result).toBe('9');
    });
  });

  describe('Atomic Operations', () => {
    it('should perform atomic getset', async () => {
      const key = `${TEST_PREFIX}getset`;

      await redis.set(key, 'old-value');
      const oldValue = await redis.getset(key, 'new-value');
      const newValue = await redis.get(key);

      expect(oldValue).toBe('old-value');
      expect(newValue).toBe('new-value');
    });

    it('should set only if not exists (setnx)', async () => {
      const key = `${TEST_PREFIX}setnx`;

      const set1 = await redis.setnx(key, 'first');
      expect(set1).toBe(1);

      const set2 = await redis.setnx(key, 'second');
      expect(set2).toBe(0);

      const value = await redis.get(key);
      expect(value).toBe('first');
    });
  });

  describe('Memory and Performance', () => {
    it('should get database size', async () => {
      const size = await redis.dbsize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThanOrEqual(0);
    });

    it('should get memory usage for key', async () => {
      const key = `${TEST_PREFIX}memory`;
      await redis.set(key, 'test-value-for-memory-check');

      const memory = await redis.memory('USAGE', key);
      expect(typeof memory).toBe('number');
      expect(memory).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid operations gracefully', async () => {
      const key = `${TEST_PREFIX}string-key`;
      await redis.set(key, 'string-value');

      // Try to use string as hash
      await expect(redis.hget(key, 'field')).rejects.toThrow();
    });

    it('should return null for non-existent keys', async () => {
      const result = await redis.get(`${TEST_PREFIX}non-existent`);
      expect(result).toBeNull();
    });
  });
});
