import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './domain/user.sql.entity';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersSqlRepository } from './infrastructure/users.sql.repository';
import { UsersSqlQueryRepository } from './infrastructure/users.sql.query.repository';
import { EmailService } from '../auth/infrastructure/email.service';
import { JwtService } from '../auth/infrastructure/jwt.service';
import { TokensBlackList } from './domain/tokens.black.list.sql.entity';
import { EmailConfirmation } from './domain/email.confirmation.entity';
import { SessionSqlQueryRepository } from '../../sessions/infrastructure/session.sql.query.repository';
import { SessionSqlRepository } from '../../sessions/infrastructure/session.sql.repository';
import { Sessions } from '../../sessions/domain/session.sql.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    TypeOrmModule.forFeature([TokensBlackList]),
    TypeOrmModule.forFeature([EmailConfirmation]),
    TypeOrmModule.forFeature([Sessions]),
  ],
  controllers: [UsersController],
  providers: [
    SessionSqlQueryRepository,
    SessionSqlRepository,
    UsersService,
    UsersSqlRepository,
    UsersSqlQueryRepository,
    EmailService,
    JwtService,
  ],
  exports: [],
})
export class UserModule {}
