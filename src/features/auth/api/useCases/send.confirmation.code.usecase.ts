import { InterlayerNotice } from "../../../../base/models/Interlayer";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { MyJwtService } from "../../infrastructure/my-jwt.service";
import { EmailService } from "../../infrastructure/email.service";
import { BadRequestException } from "@nestjs/common";
// import { randomUUID } from 'crypto';
import { UsersSqlRepository } from "../../../users/infrastructure/users.sql.repository";
import { UsersSqlQueryRepository } from "../../../users/infrastructure/users.sql.query.repository";
const crypto = require("node:crypto");
export class SendConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendConfirmationCodeCommand)
export class SendConfirmationCodeUseCase
  implements
    ICommandHandler<SendConfirmationCodeCommand, InterlayerNotice<boolean>>
{
  constructor(
    private jwtService: MyJwtService,
    private emailService: EmailService,
    private usersSqlRepository: UsersSqlRepository,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  async execute(
    command: SendConfirmationCodeCommand,
  ): Promise<InterlayerNotice<boolean>> {
    const notice = new InterlayerNotice<boolean>();
    try {
      const user = await this.usersSqlQueryRepository.findUser(command.email);
      if (!user) throw new BadRequestException("mail doesnt exist", "email");
      if (user?.emailConfirmation.isConfirmed)
        throw new BadRequestException("code is already confirm", "email");

      const newConfirmCode = crypto.randomUUID();
      const updateConfirmCode =
        await this.usersSqlRepository.updateNewConfirmCode(
          user?._id,
          newConfirmCode,
        );
      if (!updateConfirmCode) {
        notice.addError("update code error");
        return notice;
      }
      const subject = "Email Confirmation";
      const message = `<h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${newConfirmCode}'>complete registration</a>
        </p>`;
      const sendConfirmCode = await this.emailService.sendEmail(
        command.email,
        subject,
        message,
      );

      if (!sendConfirmCode) {
        notice.addError("send email error");
        return notice;
      }
      notice.addData(true);
      return notice;
    } catch (e) {
      console.log(e);
      notice.addError("send email error");
      return notice;
    }
  }
}
