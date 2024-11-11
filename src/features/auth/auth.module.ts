import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { JwtService } from './infrastructure/jwt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/domain/user.sql.entity';
import { TokensBlackList } from '../users/domain/tokens.black.list.sql.entity';
import { EmailConfirmation } from '../users/domain/email.confirmation.entity';
import { AuthService } from './application/auth.service';
import { UserModule } from '../users/user.module';
import { UsersService } from '../users/application/users.service';
import { CqrsModule } from '@nestjs/cqrs';
import { SecurityController } from './sessions/api/security.controller';
import { Sessions } from './sessions/domain/session.sql.entity';
import { GetAllSessionUseCase } from './sessions/api/useCases/get-all-sessions.usecase';
import { DeleteSessionByIdUseCase } from './sessions/api/useCases/delete-session-by-id.usecase';
import { DeleteAllSessionsUseCase } from './sessions/api/useCases/delete-all-sessions.usecase';
import { SessionSqlRepository } from './sessions/infrastructure/session.sql.repository';
import { SessionSqlQueryRepository } from './sessions/infrastructure/session.sql.query.repository';
import { LoginUseCase } from './api/useCases/login.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      TokensBlackList,
      EmailConfirmation,
      Sessions,
    ]),
    CqrsModule,
    UserModule,
  ],
  controllers: [AuthController, SecurityController],
  providers: [
    AuthService,
    UsersService,
    GetAllSessionUseCase,
    DeleteSessionByIdUseCase,
    DeleteAllSessionsUseCase,
    SessionSqlQueryRepository,
    SessionSqlRepository,
    JwtService,
    LoginUseCase,
  ],
  exports: [JwtService],
})
export class AuthModule {}
