import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UserInputDto } from './input/userInput.dto';
import { UsersService } from '../application/users.service';
import { UsersSortData } from '../../../base/sortData/sortData.model';
import { AuthGuard } from '../../../guards/auth.guard';
import { OutputUsersType } from './output/users.output.dto';
import { Pagination } from '../../../base/paginationInputDto/paginationOutput';
import { UsersSqlQueryRepository } from '../infrastructure/users.sql.query.repository';
import { CreateUserCommand } from './useCases/create.user.usecase';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { SortDirectionPipe } from '../../../base/pipes/sortDirectionPipe';
import { GetAllusersCommand } from './useCases/get.all.users.query.usecase';
import { DeleteUserCommand } from './useCases/delete.user.usecase';

@UseGuards(AuthGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    protected userService: UsersService,
    protected usersSqlQueryRepository: UsersSqlQueryRepository,
    protected commandBus: CommandBus,
    protected queryBus: QueryBus,
  ) {}

  @UsePipes(SortDirectionPipe)
  @Get()
  async getAllUsers(
    @Query() input: UsersSortData,
  ): Promise<Pagination<OutputUsersType>> {
    const commandQuery = new GetAllusersCommand(input);
    const result = await this.queryBus.execute<
      GetAllusersCommand,
      InterlayerNotice<Pagination<OutputUsersType>>
    >(commandQuery);
    if (result.hasError()) throw new NotFoundException();
    return result.data!;
  }

  @UseGuards(AuthGuard)
  @Post()
  async createUser(
    @Body() input: UserInputDto,
  ): Promise<OutputUsersType | null> {
    const { login, email, password } = input;
    const command = new CreateUserCommand(login, email, password, true);
    const createdUser = await this.commandBus.execute<
      CreateUserCommand,
      InterlayerNotice<OutputUsersType>
    >(command);
    if (createdUser.hasError()) throw new BadRequestException();

    return createdUser.data;
  }

  @HttpCode(204)
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const command = new DeleteUserCommand(id);
    const deleteUser = await this.commandBus.execute<
      DeleteUserCommand,
      InterlayerNotice<boolean>
    >(command);
    if (deleteUser.hasError())
      throw new NotFoundException(deleteUser.extensions[0].message);
    return;
  }
}
