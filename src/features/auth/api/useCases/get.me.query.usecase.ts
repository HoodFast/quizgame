import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersSqlQueryRepository } from '../../../users/infrastructure/users.sql.query.repository';
import { MyEntity } from '../output/me.entity';

export class GetMeCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetMeCommand)
export class GetMeQueryUseCase
  implements IQueryHandler<GetMeCommand, InterlayerNotice<MyEntity>>
{
  constructor(private usersSqlQueryRepository: UsersSqlQueryRepository) {}

  async execute(command: GetMeCommand): Promise<InterlayerNotice<MyEntity>> {
    const notice = new InterlayerNotice<MyEntity>();

    const result = await this.usersSqlQueryRepository.getMe(command.userId);
    if (!result) {
      notice.addError('error DAL');
      return notice;
    }
    notice.addData(result);
    return notice;
  }
}
