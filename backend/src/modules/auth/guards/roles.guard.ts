import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacGuard } from './rbac.guard';

@Injectable()
export class RolesGuard extends RbacGuard {
  constructor(reflector: Reflector) {
    super(reflector);
  }
}
