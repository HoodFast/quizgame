import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './domain/user.sql.entity';
import { TokensBlackList } from './domain/tokens.black.list.sql.entity';
import { EmailConfirmation } from './domain/email.confirmation.entity';
import { UsersController } from './api/users.controller';
import { UsersSqlRepository } from './infrastructure/users.sql.repository';
import { UsersSqlQueryRepository } from './infrastructure/users.sql.query.repository';
import { EmailService } from '../auth/infrastructure/email.service';
import { UsersService } from './application/users.service';
import { Sessions } from '../auth/sessions/domain/session.sql.entity';
import { SessionSqlQueryRepository } from '../auth/sessions/infrastructure/session.sql.query.repository';
import { SessionSqlRepository } from '../auth/sessions/infrastructure/session.sql.repository';
import { CreateUserUseCase } from './api/useCases/create.user.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteUserUseCase } from './api/useCases/delete.user.usecase';
import { GetAllUsersQueryUseCase } from './api/useCases/get.all.users.query.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      TokensBlackList,
      EmailConfirmation,
      Sessions,
    ]),

    CqrsModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersSqlRepository,
    UsersSqlQueryRepository,
    EmailService,
    UsersService,
    SessionSqlRepository,
    SessionSqlQueryRepository,
    CreateUserUseCase,
    DeleteUserUseCase,
    GetAllUsersQueryUseCase,
  ],
  exports: [
    UsersService,
    UsersSqlRepository,
    UsersSqlQueryRepository,
    EmailService,
  ],
})
export class UserModule {}
