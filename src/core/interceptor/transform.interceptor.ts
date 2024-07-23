import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
// import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data) => {
        return {
          data,
          // code: response.statusCode || HttpStatus.OK,
          code: HttpStatus.OK,
          message: 'success',
        };
      }),
    );
  }
}
