import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../infrastructure/jwt.service';
import { HttpException } from '@nestjs/common';
import { recoveryPassInputDto } from '../input/new.password.input';
import bcrypt from 'bcrypt';
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql.repository';

export class CreateRefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}
export class ChangePasswordCommand {
  constructor(public data: recoveryPassInputDto) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordUseCase
  implements ICommandHandler<ChangePasswordCommand, InterlayerNotice<boolean>>
{
  constructor(
    private jwtService: JwtService,
    private usersSqlRepository: UsersSqlRepository,
  ) {}

  async execute(
    command: ChangePasswordCommand,
  ): Promise<InterlayerNotice<boolean>> {
    const notice = new InterlayerNotice<boolean>();
    try {
      const userId = await this.jwtService.getUserIdByRecoveryCode(
        command.data.recoveryCode,
      );
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(command.data.newPassword, salt);
      const changePassword = await this.usersSqlRepository.changePass(
        userId,
        hash,
      );
      if (!changePassword) {
        notice.addError('refresh token error');
        return notice;
      }

      notice.addData(changePassword);
      return notice;
    } catch (e) {
      console.log(e);
      throw new HttpException({ message: 'Bad request' }, 400);
    }
  }
}
