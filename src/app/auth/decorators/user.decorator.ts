import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { JwtUserType } from '../types';

export const User = createParamDecorator(
  (data: keyof JwtUserType, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    return data ? request.user[data] : request.user;
  },
);
