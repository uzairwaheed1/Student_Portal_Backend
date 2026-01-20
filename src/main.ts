import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SeedService } from './seed/seed.service';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './student-course-plo-result/logging.interceptor';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Add logging interceptor to see all requests
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable global validation with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Temporarily set to false to see if extra fields are causing issues
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
      exceptionFactory: (errors) => {
        // Log validation errors for debugging
        console.error('❌ VALIDATION FAILED - Errors:', JSON.stringify(errors, null, 2));
        console.error('❌ VALIDATION FAILED - Error count:', errors.length);
        
        errors.forEach((error, index) => {
          console.error(`❌ Error ${index + 1}:`, {
            property: error.property,
            value: error.value,
            constraints: error.constraints,
            children: error.children,
          });
        });
        
        const messages = errors.map((error) => {
          const constraints = error.constraints || {};
          const property = error.property || 'unknown';
          const constraintMessages = Object.values(constraints);
          return `${property}: ${constraintMessages.join(', ')}`;
        });
        
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
          details: errors.map((error) => ({
            property: error.property,
            value: error.value,
            constraints: error.constraints,
          })),
        });
      },
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
    .addTag('Batch Management', 'Batch and semester management endpoints')
    .addTag('Program', 'Program management endpoints')
    .addTag('PLO', 'Program Learning Outcomes (PLO) management endpoints')
    .addTag('Courses', 'Course management endpoints')
    .addTag('CLOs (Course Learning Outcomes)', 'Manage Course Learning Outcomes')
    
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
