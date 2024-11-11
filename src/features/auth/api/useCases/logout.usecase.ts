import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../infrastructure/jwt.service';
import { SessionSqlRepository } from '../../sessions/infrastructure/session.sql.repository';

export class LogoutCommand {
  constructor(public token: string) {}
}

@CommandHandler(LogoutCommand)
export class LoginUseCase
  implements ICommandHandler<LogoutCommand, InterlayerNotice<boolean>>
{
  constructor(
    private jwtService: JwtService,
    private sessionSqlRepository: SessionSqlRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<InterlayerNotice<boolean>> {
    const notice = new InterlayerNotice<boolean>();
    const user = await this.jwtService.checkRefreshToken(command.token);
    if (!user) {
      notice.addError('token not valid');
      return notice;
    }
    const dataSession = await this.jwtService.getSessionDataByToken(
      command.token,
    );
    if (!dataSession) {
      notice.addError('session error');
      return notice;
    }
    const oldSession =
      await this.sessionSqlRepository.getSessionForRefreshDecodeToken(
        dataSession.iat,
        dataSession.deviceId,
      );
    if (oldSession) {
      const result = await this.sessionSqlRepository.deleteById(oldSession.id);
      notice.addData(result);
      return notice;
    } else {
      notice.addError('logout error');
      return notice;
    }
  }
}
