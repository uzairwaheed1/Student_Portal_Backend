// ============================================
// FILE: auth/guards/jwt-auth.guard.ts
// ============================================
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('🔐 JwtAuthGuard: Checking authentication for', request.url);
    console.log('🔐 JwtAuthGuard: Auth header present?', !!request.headers.authorization);
    
    return super.canActivate(context);
  }
}
