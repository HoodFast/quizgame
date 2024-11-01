import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import configuration, { ConfigServiceType, validate } from './settings/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';

const services = [
  AppService,

];
@Module({
  imports: [
    CqrsModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validate,


      envFilePath: ['.env'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigServiceType) => {
        const sqlDataBaseSettings = configService.get('sqlDataBaseSettings', {
          infer: true,
        });
        return {
          type: 'postgres',
          host: sqlDataBaseSettings?.SQL_HOST,
          username: sqlDataBaseSettings?.SQL_USERNAME,
          password: sqlDataBaseSettings?.SQL_PASS,
          database: 'neondb',
          ssl: true,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

  ],
  controllers: [
    AppController,

  ],
  providers: [

    AppService,

  ],
})
export class AppModule {}
