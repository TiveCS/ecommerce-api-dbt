import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtUserType } from '../types';

@Injectable()
export class MerchantOnlyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const expressUser = request.user;

    const user: JwtUserType = expressUser as JwtUserType;

    return user.role === 'merchant';
  }
}
