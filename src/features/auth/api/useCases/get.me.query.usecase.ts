import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Pagination } from '../../../../base/paginationInputDto/paginationOutput';
import { UsersSqlQueryRepository } from '../../../users/infrastructure/users.sql.query.repository';
import { OutputUsersType } from '../../../users/api/output/users.output.dto';
import { MyEntity } from '../output/me.entity';

export class GetMeCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetMeCommand)
export class GetMyQueryUseCase
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
