import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersSqlQueryRepository } from '../../../users/infrastructure/users.sql.query.repository';
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql.repository';

export class EmailConfirmationCommand {
  constructor(public code: string) {}
}

@CommandHandler(EmailConfirmationCommand)
export class EmailConfirmationUseCase
  implements
    ICommandHandler<EmailConfirmationCommand, InterlayerNotice<boolean>>
{
  constructor(
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private usersSqlRepository: UsersSqlRepository,
  ) {}

  async execute(
    command: EmailConfirmationCommand,
  ): Promise<InterlayerNotice<boolean>> {
    const notice = new InterlayerNotice<boolean>();
    const user = await this.usersSqlQueryRepository.getUserByCode(command.code);

    if (!user) throw new BadRequestException('invalid code', 'code');

    if (user?.emailConfirmation.isConfirmed)
      throw new BadRequestException('code is already confirm', 'code');

    if (user?.emailConfirmation.expirationDate < new Date()) {
      throw new BadRequestException({
        message: 'expired',
        field: 'expirationDate',
      });
    }
    const confirmEmail = await this.usersSqlRepository.confirmEmail(user._id);

    if (!confirmEmail) {
      notice.addError('confirm email error');
      return notice;
    }
    notice.addData(true);
    return notice;
  }
}
