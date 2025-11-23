import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeedService } from './seed/seed.service';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

    // Enable CORS
  app.enableCors();

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('OBE Automation System API')
    .setDescription('API documentation for Outcome-Based Education (OBE) Automation System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name will be used in @ApiBearerAuth()
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Admin', 'Admin management endpoints')
    .addTag('Faculty', 'Faculty management endpoints')
    .addTag('Student', 'Student management endpoints')
    .addTag('Invitation', 'Invitation flow endpoints')
    .addTag('Pre-registration', 'Student pre-registration endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);


  // Run seed on startup (only in development)
  if (process.env.NODE_ENV === 'development') {
    try {
      const seedService = app.get(SeedService);
      await seedService.seedAll();
    } catch (error) {
      logger.error('Failed to seed database:', error.message);
    }
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}


void bootstrap();
