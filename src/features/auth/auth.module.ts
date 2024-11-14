import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { MyJwtService } from './infrastructure/my-jwt.service';
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
import { CreateUserUseCase } from '../users/api/useCases/create.user.usecase';
import { EmailConfirmationUseCase } from './api/useCases/email.confirmation.usecase';
import { SendConfirmationCodeUseCase } from './api/useCases/send.confirmation.code.usecase';
import { SendRecoveryCodeUseCase } from './api/useCases/send.recovery.code.usecase';
import { GetMeQueryUseCase } from './api/useCases/get.me.query.usecase';
import { ChangePasswordUseCase } from './api/useCases/change.password.usecase';
import { CreateRefreshTokenUseCase } from './api/useCases/create.refresh.token.usecase';
import { LogoutUseCase } from './api/useCases/logout.usecase';
import { JwtModule } from '@nestjs/jwt';

const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

const useCases = [
  GetAllSessionUseCase,
  DeleteSessionByIdUseCase,
  DeleteAllSessionsUseCase,
  LoginUseCase,
  CreateUserUseCase,
  EmailConfirmationUseCase,
  SendConfirmationCodeUseCase,
  SendRecoveryCodeUseCase,
  GetMeQueryUseCase,
  ChangePasswordUseCase,
  CreateRefreshTokenUseCase,
  LogoutUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      TokensBlackList,
      EmailConfirmation,
      Sessions,
    ]),
    JwtModule.register({}),
    CqrsModule,
    UserModule,
  ],
  controllers: [AuthController, SecurityController],
  providers: [
    AuthService,
    UsersService,
    MyJwtService,
    SessionSqlQueryRepository,
    SessionSqlRepository,
    ...useCases,
  ],
  exports: [MyJwtService],
})
export class AuthModule {}
