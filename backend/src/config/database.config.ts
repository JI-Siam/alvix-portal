import { DataSourceOptions } from 'typeorm';

export function buildDbOptions(env: NodeJS.ProcessEnv): DataSourceOptions {
  return {
    type: 'postgres',
    url: env.DATABASE_URL,
    ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    synchronize: false, // never true: schema changes go through migrations
    logging: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  };
}
