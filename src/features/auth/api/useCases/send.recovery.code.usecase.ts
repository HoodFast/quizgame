import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MyJwtService } from '../../infrastructure/my-jwt.service';
import { EmailService } from '../../infrastructure/email.service';

export class SendRecoveryCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendRecoveryCodeCommand)
export class SendRecoveryCodeUseCase
  implements
    ICommandHandler<SendRecoveryCodeCommand, InterlayerNotice<boolean>>
{
  constructor(
    private jwtService: MyJwtService,
    private emailService: EmailService,
  ) {}

  async execute(
    command: SendRecoveryCodeCommand,
  ): Promise<InterlayerNotice<boolean>> {
    const notice = new InterlayerNotice<boolean>();
    try {
      const subject = 'Password recovery';
      const recoveryCode = this.jwtService.createRecoveryCode(command.email);
      const message = `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
      </p>`;

      const sendRecovery = await this.emailService.sendEmail(
        command.email,
        subject,
        message,
      );
      if (!sendRecovery) {
        notice.addError('send email error');
        return notice;
      }
      notice.addData(true);
      return notice;
    } catch (e) {
      console.log(e);
      notice.addError('send email error');
      return notice;
    }
  }
}
