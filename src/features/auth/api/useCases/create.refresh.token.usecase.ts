import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MyJwtService } from '../../infrastructure/my-jwt.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersSqlQueryRepository } from '../../../users/infrastructure/users.sql.query.repository';
import { SessionSqlRepository } from '../../sessions/infrastructure/session.sql.repository';

export class CreateRefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}

export class CreateRefreshTokenCommand {
  constructor(
    public title: string,
    public ip: string,
    public token: string,
  ) {}
}

@CommandHandler(CreateRefreshTokenCommand)
export class CreateRefreshTokenUseCase
  implements
    ICommandHandler<
      CreateRefreshTokenCommand,
      InterlayerNotice<CreateRefreshTokenOutput>
    >
{
  constructor(
    private jwtService: MyJwtService,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private sessionSqlRepository: SessionSqlRepository,
  ) {}

  async execute(
    command: CreateRefreshTokenCommand,
  ): Promise<InterlayerNotice<CreateRefreshTokenOutput>> {
    const notice = new InterlayerNotice<CreateRefreshTokenOutput>();
    const user = await this.jwtService.checkRefreshToken(command.token);
    if (!user) throw new UnauthorizedException('check refresh token error');

    const session: { iat: Date; deviceId: string; userId: string } | null =
      await this.jwtService.getSessionDataByToken(command.token);
    console.log(`session result:${session}`);
    if (!session) {
      throw new UnauthorizedException('couldn`t get the data session');
    }

    const oldSession =
      await this.sessionSqlRepository.getSessionForRefreshDecodeToken(
        session.iat,
        session.deviceId,
      );

    const deviceId = oldSession?.deviceId;
    if (oldSession) {
      await this.sessionSqlRepository.deleteById(oldSession.id);
    } else {
      throw new UnauthorizedException('The old session is gone');
    }
    const accessToken = await this.jwtService.createPassportJWT(user._id);
    const refreshToken = await this.jwtService.createPassportRefreshJWT(
      user._id,
      deviceId,
      command.ip,
      command.title,
    );
    if (!refreshToken) {
      notice.addError('refresh token error');
      return notice;
    }
    const addToBlackList =
      await this.usersSqlQueryRepository.addTokenToBlackList(
        user!._id,
        command.token,
      );
    if (!addToBlackList) throw new NotFoundException();
    notice.addData({ accessToken, refreshToken });
    return notice;
  }
}
