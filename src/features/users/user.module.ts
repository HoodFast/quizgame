import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../users/domain/user.sql.entity';
import { UsersController } from '../../users/api/users.controller';
import { UsersService } from '../../users/application/users.service';
import { UsersSqlRepository } from '../../users/infrastructure/users.sql.repository';
import { UsersSqlQueryRepository } from '../../users/infrastructure/users.sql.query.repository';
import { EmailService } from '../../auth/infrastructure/email.service';
import { JwtService } from '../../auth/infrastructure/jwt.service';
import { TokensBlackList } from '../../users/domain/tokens.black.list.sql.entity';
import { EmailConfirmation } from '../../users/domain/email.confirmation.entity';
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
