import { GetAllSessionUseCase } from '../../sessions/api/useCases/get-all-sessions.usecase';
import { DeleteSessionByIdUseCase } from '../../sessions/api/useCases/delete-session-by-id.usecase';
import { DeleteAllSessionsUseCase } from '../../sessions/api/useCases/delete-all-sessions.usecase';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './domain/user.sql.entity';
import { TokensBlackList } from './domain/tokens.black.list.sql.entity';
import { EmailConfirmation } from './domain/email.confirmation.entity';
import { Sessions } from '../../sessions/domain/session.sql.entity';
import { UsersController } from './api/users.controller';
import { SessionSqlQueryRepository } from '../../sessions/infrastructure/session.sql.query.repository';
import { SessionSqlRepository } from '../../sessions/infrastructure/session.sql.repository';
import { UsersSqlRepository } from './infrastructure/users.sql.repository';
import { UsersSqlQueryRepository } from './infrastructure/users.sql.query.repository';
import { EmailService } from '../auth/infrastructure/email.service';
import { JwtService } from '../auth/infrastructure/jwt.service';
import { UsersService } from './application/users.service';
import { AuthService } from '../auth/application/auth.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      TokensBlackList,
      EmailConfirmation,
      Sessions,
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersSqlRepository,
    UsersSqlQueryRepository,
    EmailService,
    UsersService,
    JwtService,
    SessionSqlRepository,
    SessionSqlQueryRepository,
  ],
  exports: [
    UsersService,
    UsersSqlRepository,
    UsersSqlQueryRepository,
    EmailService,
    JwtService,
  ],
})
export class UserModule {}
