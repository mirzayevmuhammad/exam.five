import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const role = this.reflector.get('role', handler);
    if (role.includes(req.user.userRole)) return true;
    if (role.includes('owner') && req.params.id === req.user.userId)
      return true;
    throw new ForbiddenException('role required');
  }
}
