import { UsersService } from '../../../src/features/users/application/users.service';

export class UsersServiceEmailMock extends UsersService {
  sendMessageOnEmail(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
