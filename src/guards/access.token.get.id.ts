import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { MyJwtService } from '../features/auth/infrastructure/my-jwt.service';

@Injectable()
export class AccessTokenGetId implements CanActivate {
  constructor(private jwtService: MyJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      return true;
    }
    const tokenBearer = request.headers.authorization;
    const token = tokenBearer.split(' ')[1];
    const userId = await this.jwtService.getUserIdByToken(token);
    request.userId = userId;
    return true;
  }
}
