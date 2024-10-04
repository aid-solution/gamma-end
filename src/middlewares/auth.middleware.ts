import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  async use(request: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('failed_auth');
    }
    let payload: { id: string; login: string };
    try {
      payload = await this.authService.decodeAuthToken(token);
    } catch (error) {
      throw new UnauthorizedException('failed_auth');
    }

    const user = await this.usersService.findOne(payload.id);
    if (!user) throw new NotFoundException('user_not_found');

    request['user'] = user;
    return next();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ||
      (request.headers['Authorization'] as string)?.split(' ') || ['', ''];
    return type === 'Bearer' ? token : undefined;
  }
}
