import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration, {
  ConfigServiceType,
  validate,
} from "./settings/configuration";
import { UserModule } from "./features/users/user.module";
import { AuthModule } from "./features/auth/auth.module";
import { BloggersPlatformModule } from "./features/bloggers-platform/bloggers.platform.module";
import { TestingModule } from "./features/testing/testing.module";
import { QuizModule } from "./features/quiz/quiz.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validate,
      envFilePath: [".env"],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigServiceType) => {
        const sqlDataBaseSettings = configService.get("sqlDataBaseSettings", {
          infer: true,
        });

        return {
          type: "postgres",
          host: sqlDataBaseSettings?.SQL_HOST,
          username: sqlDataBaseSettings?.SQL_USERNAME,
          password: sqlDataBaseSettings?.SQL_PASS,
          database: "default_db",
          // ssl: true,
          ssl: {
            rejectUnauthorized: false, // Добавлено для игнорирования проверки сертификата
          },
          autoLoadEntities: true,
          synchronize: true,
          port: 5432,
        };
      },
    }),
    AuthModule,
    UserModule,
    BloggersPlatformModule,
    TestingModule,
    QuizModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}

const param = [
  "AC_SECRET+",
  "ENV+",
  "RECOVERY_SECRET+",
  "RECOVERY_TIME+",
  "SQL_DATABASE+",
  "SQL_PASS+",
  "AC_TIME+",
  "PORT+",
  "RT_SECRET+",
  "RT_TIME+",
  "SQL_HOST+",
  "SQL_USERNAME+",
];
