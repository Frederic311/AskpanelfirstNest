import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'process';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT ,
  username: process.env.DATABASE_USER ,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME ,
  entities: [__dirname + '/src/features/**/entities/*.entity{.js,.ts}'],
  migrations: [__dirname + '/src/migrations/*{.js,.ts}'],
  namingStrategy: new SnakeNamingStrategy(),
  cli: {
    migrationsDir: __dirname + '/src/migrations',
  },
} as DataSourceOptions);
