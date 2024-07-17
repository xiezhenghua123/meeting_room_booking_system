import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const sqlConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'meeting_room_booking_system',
  synchronize: true,
  autoLoadEntities: true,
  entities: [],
  connectorPackage: 'mysql2',
  logging: true,
  poolSize: 10,
};
