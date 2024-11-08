import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(`failed_auth`);
    }
    let payload: { id: string; login: string };
    try {
      payload = await this.authService.decodeAuthToken(token);
    } catch (error) {
      throw new UnauthorizedException(`failed_auth`);
    }
    // check user existence
    const user = await this.usersService.findOne(payload.id, '-password');
    if (!user) throw new NotFoundException(`user_not_found`);

    request['user'] = user;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ||
      request.headers['Authorization']?.split(' ') || ['', ''];
    return type === 'Bearer' ? token : undefined;
  }
}
