import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildDbOptions } from './database.config';

export default new DataSource({
  ...buildDbOptions(process.env),
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  subscribers: [__dirname + '/../**/*.subscriber.{ts,js}'],
  migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
} as any);
