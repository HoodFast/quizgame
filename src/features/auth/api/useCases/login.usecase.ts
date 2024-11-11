import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../../bloggers-platform/blogs/infrastructure/blogs.sql.repository';
import { AuthService } from '../../application/auth.service';
import { randomUUID } from 'crypto';
import { UsersService } from '../../../users/application/users.service';
import { SessionSqlRepository } from '../../sessions/infrastructure/session.sql.repository';
import { JwtService } from '../../infrastructure/jwt.service';

export class LoginCommandOutput {
  accessToken: string;
  refreshToken: string;
}
export class LoginCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
    public ip: string,
    public title: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase
  implements
    ICommandHandler<LoginCommand, InterlayerNotice<LoginCommandOutput>>
{
  constructor(
    private usersService: UsersService,
    private sessionSqlRepository: SessionSqlRepository,
    private jwtService: JwtService,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<InterlayerNotice<LoginCommandOutput>> {
    const notice = new InterlayerNotice<LoginCommandOutput>();
    const { loginOrEmail, password, ip, title } = command;
    const userId = await this.usersService.checkCredentials(
      loginOrEmail,
      password,
    );
    if (!userId) {
      notice.addError('login error');
      return notice;
    }
    const oldSession = await this.sessionSqlRepository.getSessionForUserId(
      userId.toString(),
      title,
    );
    const deviceId = oldSession?.deviceId || randomUUID();

    if (oldSession) {
      await this.sessionSqlRepository.deleteById(oldSession.id);
    }
    const accessToken = await this.jwtService.createJWT(userId);
    if (!accessToken) {
      notice.addError('login error');
      return notice;
    }
    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
      ip,
      title,
    );
    if (!refreshToken) {
      notice.addError('login error');
      return notice;
    }
    notice.addData({ accessToken, refreshToken });
    return notice;
  }
}