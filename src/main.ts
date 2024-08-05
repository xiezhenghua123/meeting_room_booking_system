import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpBadRequestFilter } from './core/filter/http-bad-request.filter';
import { TransformInterceptor } from './core/interceptor/transform.interceptor';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { InvokeRecordInterceptor } from './core/interceptor/invoke-record.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpBadRequestFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new InvokeRecordInterceptor());

  // swagger
  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('NestJS API')
    .setDescription('The NestJS API description')
    .setVersion('1.0')
    .addTag('nestjs')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  const configService = app.get(ConfigService);

  app.enableCors();

  await app.listen(configService.get('nest_server_post'));
}
bootstrap();
