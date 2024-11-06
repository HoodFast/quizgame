import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { JwtService } from './infrastructure/jwt.service';
import { UsersSqlQueryRepository } from '../users/infrastructure/users.sql.query.repository';
import { UsersSqlRepository } from '../users/infrastructure/users.sql.repository';
import { SessionSqlRepository } from '../../sessions/infrastructure/session.sql.repository';
import { SessionSqlQueryRepository } from '../../sessions/infrastructure/session.sql.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/domain/user.sql.entity';
import { TokensBlackList } from '../users/domain/tokens.black.list.sql.entity';
import { EmailConfirmation } from '../users/domain/email.confirmation.entity';
import { Sessions } from '../../sessions/domain/session.sql.entity';
import { AuthService } from './application/auth.service';
import { UsersService } from '../users/application/users.service';
import { EmailService } from './infrastructure/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      TokensBlackList,
      EmailConfirmation,
      Sessions,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    JwtService,
    UsersSqlQueryRepository,
    UsersSqlRepository,
    SessionSqlRepository,
    SessionSqlQueryRepository,
    AuthService,
    UsersService,
    EmailService,
  ],
  exports: [],
})
export class AuthModule {}
