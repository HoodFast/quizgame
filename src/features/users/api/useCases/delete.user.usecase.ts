import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { UsersSqlRepository } from '../../infrastructure/users.sql.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase
  implements ICommandHandler<DeleteUserCommand, InterlayerNotice<boolean>>
{
  constructor(private usersSqlRepository: UsersSqlRepository) {}

  async execute(
    command: DeleteUserCommand,
  ): Promise<InterlayerNotice<boolean>> {
    const notice = new InterlayerNotice<boolean>();
    const deleted = await this.usersSqlRepository.deleteUser(command.userId);
    if (!deleted) {
      notice.addError('delete user error');
      return notice;
    }
    notice.addData(true);
    return notice;
  }
}
