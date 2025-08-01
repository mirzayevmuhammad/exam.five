import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  public redis: Redis;
  private duration: number = 60;
  constructor() {
    this.redis = new Redis({
      port: +(process.env.REDIS_PORT as string),
      host: process.env.REDIS_HOST as string,
    });
    this.redis.on('connect', () => {
      console.log('Redis connected');
    });
    this.redis.on('error', (error) => {
      console.log('Redis connection failed', error);
      this.redis.quit();
      process.exit(1);
    });
  }
  async setOtp(phone_number: string, otp: string): Promise<string> {
    const key = `user:${phone_number}`;
    const result = await this.redis.setex(key, this.duration, otp);
    return result;
  }

  async getKey(key: string) {
    return await this.redis.get(key);
  }

  async getTtlKey(key: string) {
    const ttl = await this.redis.ttl(key);
    return ttl;
  }

  async delKey(key: string) {
    await this.redis.del(key);
  }

  async setSessionTokenUser(phone_number: string, token: string) {
    await this.redis.setex(`session_token:${phone_number}`, 300, token);
  }
}
