import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log(context.getHandler());
    const token = req.cookie['jwt'];
    try {
      const { userId, userRole } = await this.jwtService.verifyAsync(token);
      req.user = { userId, userRole };
      return true;
    } catch (error) {
      throw new ForbiddenException('token is isvalid');
    }
  }
}
