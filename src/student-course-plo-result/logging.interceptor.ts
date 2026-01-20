import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    
    this.logger.log(`🔵 Incoming Request: ${method} ${url}`);
    this.logger.log(`📦 Request Body: ${JSON.stringify(body, null, 2)}`);
    this.logger.log(`🔑 Auth Header: ${headers.authorization ? 'Present' : 'Missing'}`);
    this.logger.log(`👤 Request User: ${JSON.stringify(request.user || 'Not set', null, 2)}`);

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        this.logger.log(`✅ Request completed: ${method} ${url} (${Date.now() - now}ms)`);
      }),
    );
  }
}
