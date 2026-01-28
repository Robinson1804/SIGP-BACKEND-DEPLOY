import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('SIGP API')
    .setDescription('Sistema Integral de Gestion de Proyectos - API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('planning', 'Strategic planning (PGD, OEI, OGD, OEGD, AE)')
    .addTag('poi', 'Projects and activities')
    .addTag('agile', 'Agile management (Scrum & Kanban)')
    .addTag('rrhh', 'Human resources')
    .addTag('notificaciones', 'Notifications')
    .addTag('dashboard', 'Dashboards and metrics')
    .addTag('storage', 'File storage')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3010;
  await app.listen(port);

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                          SIGP API                             ║
║         Sistema Integral de Gestion de Proyectos             ║
╟──────────────────────────────────────────────────────────────╢
║  Server running on: http://localhost:${port}/api/v1           ║
║  Swagger docs: http://localhost:${port}/api/docs             ║
╚══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
