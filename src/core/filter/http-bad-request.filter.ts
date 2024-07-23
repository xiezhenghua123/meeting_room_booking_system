import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as moment from 'moment'; // moment2.x不支持默认导出，所以需要使用* as moment导入

// 统一格式返回，全局过滤器
@Catch(HttpException)
export class HttpBadRequestFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    // 用于接收主动发错的错误信息
    const data = exception.getResponse();
    const timestamp = moment().format('yyyy-MM-DD HH:mm:ss');
    const responseData = {
      path: request.url,
      timestamp,
      error: 'Error',
    };
    if (typeof data === 'string') {
      responseData['message'] = data;
      responseData['code'] = status;
    } else {
      responseData['code'] = data['statusCode'];
      responseData['message'] = data['message']?.join(',');
      responseData['error'] = data['error'];
    }
    response.status(status).json(responseData);
  }
}
