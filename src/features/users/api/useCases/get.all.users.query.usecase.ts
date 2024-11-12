import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OutputUsersType } from '../output/users.output.dto';
import { UsersSqlQueryRepository } from '../../infrastructure/users.sql.query.repository';
import { UsersSortData } from '../../../../base/sortData/sortData.model';
import { Pagination } from '../../../../base/paginationInputDto/paginationOutput';

export class GetAllusersCommand {
  constructor(public input: UsersSortData) {}
}

@QueryHandler(GetAllusersCommand)
export class GetAllUsersQueryUseCase
  implements
    IQueryHandler<
      GetAllusersCommand,
      InterlayerNotice<Pagination<OutputUsersType>>
    >
{
  constructor(private usersSqlQueryRepository: UsersSqlQueryRepository) {}

  async execute(
    command: GetAllusersCommand,
  ): Promise<InterlayerNotice<Pagination<OutputUsersType>>> {
    const notice = new InterlayerNotice<Pagination<OutputUsersType>>();
    const sortData: UsersSortData = {
      searchLoginTerm: command.input.searchLoginTerm ?? '',
      searchEmailTerm: command.input.searchEmailTerm ?? '',
      sortBy: command.input.sortBy ?? 'createdAt',
      sortDirection: command.input.sortDirection,
      pageNumber: command.input.pageNumber ? +command.input.pageNumber : 1,
      pageSize: command.input.pageSize ? +command.input.pageSize : 1,
    };
    const result = await this.usersSqlQueryRepository.getAllUsers(sortData);
    if (!result) {
      notice.addError('error DAL');
      return notice;
    }
    notice.addData(result);
    return notice;
  }
}
