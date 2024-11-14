import { MyJwtService } from '../infrastructure/my-jwt.service';
import { Injectable } from '@nestjs/common';
import { UsersSqlQueryRepository } from '../../users/infrastructure/users.sql.query.repository';

@Injectable()
export class AuthService {
  constructor(
    protected jwtService: MyJwtService,
    protected usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  // async confirmEmail(code: string) {
  //   const user = await this.usersSqlQueryRepository.getUserByCode(code);
  //   if (!user) throw new BadRequestException('invalid code', 'code');
  //   if (user?.emailConfirmation.isConfirmed)
  //     throw new BadRequestException('code is already confirm', 'code');
  //
  //   if (user?.emailConfirmation.expirationDate < new Date()) {
  //     throw new BadRequestException({
  //       message: 'expired',
  //       field: 'expirationDate',
  //     });
  //   }
  //   const confirmEmail = await this.usersSqlRepository.confirmEmail(user._id);
  //   return confirmEmail;
  // }
  //
  // async sendRecovery(email: string) {
  //   const subject = 'Password recovery';
  //   const recoveryCode = this.jwtService.createRecoveryCode(email);
  //   const message = `<h1>Password recovery</h1>
  //       <p>To finish password recovery please follow the link below:
  //         <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
  //     </p>`;
  //   try {
  //     await this.emailService.sendEmail(email, subject, message);
  //   } catch (e) {
  //     console.log(e);
  //     return;
  //   }
  //   return;
  // }
  //
  // async refreshTokensPair(
  //   user: UserEntity,
  //   ip: string,
  //   title: string,
  //   token: string,
  // ) {
  //   const session: { iat: Date; deviceId: string; userId: string } | null =
  //     await this.jwtService.getSessionDataByToken(token);
  //   console.log(`session result:${session}`);
  //   if (!session)
  //     throw new UnauthorizedException('couldn`t get the data session');
  //
  //   const oldSession =
  //     await this.sessionSqlRepository.getSessionForRefreshDecodeToken(
  //       session.iat,
  //       session.deviceId,
  //     );
  //
  //   const deviceId = oldSession?.deviceId;
  //   if (oldSession) {
  //     await this.sessionSqlRepository.deleteById(oldSession.id);
  //   } else {
  //     throw new UnauthorizedException('The old session is gone');
  //   }
  //   const accessToken = await this.jwtService.createJWT(user._id);
  //   const refreshToken = await this.jwtService.createRefreshJWT(
  //     user._id,
  //     deviceId,
  //     ip,
  //     title,
  //   );
  //   return { accessToken, refreshToken };
  // }
  //
  // async resendConfirmationCode(email: string) {
  //   const user = await this.usersSqlQueryRepository.findUser(email);
  //   if (!user) throw new BadRequestException('mail doesnt exist', 'email');
  //   if (user?.emailConfirmation.isConfirmed)
  //     throw new BadRequestException('code is already confirm', 'email');
  //
  //   const newConfirmCode = randomUUID();
  //   const updateConfirmCode =
  //     await this.usersSqlRepository.updateNewConfirmCode(
  //       user?._id,
  //       newConfirmCode,
  //     );
  //   if (!updateConfirmCode) return false;
  //   const subject = 'Email Confirmation';
  //   const message = `<h1>Thank for your registration</h1>
  //       <p>To finish registration please follow the link below:
  //           <a href='https://somesite.com/confirm-email?code=${newConfirmCode}'>complete registration</a>
  //       </p>`;
  //   const sendMail = await this.emailService.sendEmail(email, subject, message);
  //   return sendMail;
  // }
}
