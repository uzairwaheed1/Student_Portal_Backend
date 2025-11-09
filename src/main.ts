import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeedService } from './seed/seed.service';
import { Logger } from '@nestjs/common';

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
