import { InterlayerNotice } from "../../../../base/models/Interlayer";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { OutputUsersType } from "../output/users.output.dto";
import bcrypt from "bcrypt";
import { add } from "date-fns/add";
import { UsersSqlRepository } from "../../infrastructure/users.sql.repository";
// import { randomUUID } from 'crypto';
import { UsersSqlQueryRepository } from "../../infrastructure/users.sql.query.repository";
import { EmailService } from "../../../auth/infrastructure/email.service";
const crypto = require("node:crypto");

export class CreateUserCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
    public isConfirmed?: boolean,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements
    ICommandHandler<CreateUserCommand, InterlayerNotice<OutputUsersType>>
{
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private emailService: EmailService,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<InterlayerNotice<OutputUsersType>> {
    const notice = new InterlayerNotice<OutputUsersType>();
    const checkUserExistLogin = await this.usersSqlRepository.doesExistByLogin(
      command.login,
    );

    if (checkUserExistLogin) {
      notice.addError("user is already exist");
      return notice;
      // throw new BadRequestException('user is already exist', 'login');
    }

    const checkUserExistEmail = await this.usersSqlRepository.doesExistByEmail(
      command.email,
    );

    if (checkUserExistEmail) {
      notice.addError("email is already exist");
      return notice;
      // throw new BadRequestException('email is already exist', 'email');
    }

    const createdAt = new Date();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(command.password, salt);

    const userData = {
      accountData: {
        _passwordHash: hash,
        createdAt,
        email: command.email,
        login: command.login,
      },
      emailConfirmation: {
        confirmationCode: crypto.randomUUID(),
        expirationDate: add(new Date(), {
          minutes: 15,
        }),
        isConfirmed: command.isConfirmed ? command.isConfirmed : false,
      },
      tokensBlackList: [],
    };

    const createdUser = await this.usersSqlRepository.createUser(userData);
    if (!createdUser) {
      notice.addError("error BD");
      return notice;
    }

    if (!command.isConfirmed) {
      await this.sendConfirmCode(createdUser!.email);
    }
    notice.addData(createdUser!);
    return notice;
  }

  async sendConfirmCode(email: string) {
    try {
      const user = await this.usersSqlQueryRepository.findUser(email);
      if (!user) return false;
      const subject = "Email Confirmation";
      const message = `<h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${user.emailConfirmation.confirmationCode}'>complete registration</a>
        </p>`;
      const send = await this.emailService.sendEmail(email, subject, message);
      return send;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
}
