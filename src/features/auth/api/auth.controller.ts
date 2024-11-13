import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './input/login.dto';
import { Request, Response } from 'express';
import { AuthService } from '../application/auth.service';
import { UsersService } from '../../users/application/users.service';
import {
  Limiter,
  LimiterForRegistration,
} from '../../../guards/limitter.guard';
import { recoveryPass } from './input/recovery.password.input';
import { recoveryPassInputDto } from './input/new.password.input';
import { JwtService } from '../infrastructure/jwt.service';
import { AccessTokenAuthGuard } from '../../../guards/access.token.auth.guard';
import { UserId } from '../../../decorators/userId';
import { confirmDto } from '../../users/api/input/conf.code.dto';
import { UserInputDto } from '../../users/api/input/userInput.dto';
import { emailResendingDto } from './input/email.resending.input';
import { RefreshTokenGuard } from '../../../guards/refresh-token.guards';
import { UsersSqlQueryRepository } from '../../users/infrastructure/users.sql.query.repository';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand, LoginCommandOutput } from './useCases/login.usecase';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { LogoutCommand } from './useCases/logout.usecase';
import { CreateUserCommand } from '../../users/api/useCases/create.user.usecase';
import { OutputUsersType } from '../../users/api/output/users.output.dto';
import { EmailConfirmationCommand } from './useCases/email.confirmation.usecase';
import { SendRecoveryCodeCommand } from './useCases/send.recovery.code.usecase';
import { SendConfirmationCodeCommand } from './useCases/send.confirmation.code.usecase';
import { MyEntity } from './output/me.entity';
import { GetMeCommand } from './useCases/get.me.query.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @HttpCode(200)
  @UseGuards(Limiter)
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Ip() ip: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const title = req.get('User-Agent') || 'none title';
      if (!body.loginOrEmail || !body.password) {
        throw new BadRequestException('Missing login or password');
      }
      const command = new LoginCommand(
        body.loginOrEmail,
        body.password,
        ip,
        title,
      );
      const login = await this.commandBus.execute<
        LoginCommand,
        InterlayerNotice<LoginCommandOutput>
      >(command);
      if (login.hasError())
        throw new UnauthorizedException('get tokens pair error');

      const { accessToken, refreshToken } = login.data!;
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      });
      return { accessToken };
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  @Post('logout')
  async logout(@Req() req: Request) {
    const token = req.cookies.refreshToken;
    const command = new LogoutCommand(token);
    const logout = await this.commandBus.execute<
      LogoutCommand,
      InterlayerNotice<boolean>
    >(command);
    if (logout.hasError()) throw new Error('logout error');
    return;
  }

  @UseGuards(LimiterForRegistration)
  @HttpCode(204)
  @Post('registration')
  async registration(@Body() data: UserInputDto) {
    const { login, email, password } = data;
    const command = new CreateUserCommand(login, email, password);
    const createUser = await this.commandBus.execute<
      CreateUserCommand,
      InterlayerNotice<OutputUsersType>
    >(command);
    if (createUser.hasError())
      throw new BadRequestException(createUser.extensions[0].message);
    return;
  }

  @UseGuards(Limiter)
  @HttpCode(204)
  @Post('registration-confirmation')
  async emailConfirmation(@Body() data: confirmDto) {
    if (!data.code) throw new BadRequestException('error code', 'code');
    const command = new EmailConfirmationCommand(data.code);
    const result = await this.commandBus.execute<
      EmailConfirmationCommand,
      InterlayerNotice<boolean>
    >(command);
    if (result.hasError()) throw new BadRequestException();
    return;
  }

  @UseGuards(Limiter)
  @HttpCode(204)
  @Post('password-recovery')
  async passwordRecovery(@Body() data: recoveryPass) {
    const send = await this.commandBus.execute<
      SendRecoveryCodeCommand,
      InterlayerNotice<boolean>
    >(new SendRecoveryCodeCommand(data.email));
    if (!send.hasError()) throw new BadRequestException();
    return;
  }

  @UseGuards(Limiter)
  @HttpCode(204)
  @Post('new-password')
  async newPassword(@Body() data: recoveryPassInputDto) {
    return await this.usersService.changePass(data);
  }

  @HttpCode(200)
  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const title = req.headers['user-agent'] || 'none title';
    const ip = req.ip || 'none ip';

    const token = req.cookies.refreshToken;

    const user = await this.jwtService.checkRefreshToken(token);
    if (!user) throw new UnauthorizedException('check refresh token error');

    const tokens = await this.authService.refreshTokensPair(
      user,
      ip,
      title,
      token,
    );
    const addToBlackList =
      await this.usersSqlQueryRepository.addTokenToBlackList(user._id, token);
    if (!addToBlackList) throw new NotFoundException();
    const { accessToken, refreshToken } = tokens;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken };
  }

  @UseGuards(Limiter)
  @HttpCode(204)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() data: emailResendingDto) {
    const send = await this.commandBus.execute<
      SendConfirmationCodeCommand,
      InterlayerNotice<boolean>
    >(new SendConfirmationCodeCommand(data.email));
    if (send.hasError())
      throw new BadRequestException(send.extensions[0].message);
    return;
  }

  @UseGuards(AccessTokenAuthGuard)
  @Get('me')
  async getMe(@UserId() userId: string) {
    const my = await this.queryBus.execute<
      GetMeCommand,
      InterlayerNotice<MyEntity>
    >(new GetMeCommand(userId));

    if (my.hasError()) throw new UnauthorizedException('getMe error');
    return {
      userId: my.data!.id,
      login: my.data!.accountData.login,
      email: my.data!.accountData.email,
    };
  }
}
