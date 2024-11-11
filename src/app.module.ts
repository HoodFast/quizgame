import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, {
  ConfigServiceType,
  validate,
} from './settings/configuration';
import { UserModule } from './features/users/user.module';
import { AuthModule } from './features/auth/auth.module';
import { BloggersPlatform } from './features/bloggers-platform/bloggers.platform.module';
import { TestingModule } from './features/testing/testing.module';

@Module({
  imports: [
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
    AuthModule,
    UserModule,
    BloggersPlatform,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
