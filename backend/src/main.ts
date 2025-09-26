import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security middleware with CSP
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "default-src": ["'self'"],
        "img-src": ["'self'", 'data:', 'https:'],
        "script-src": ["'self'", "'unsafe-inline'", 'https:'],
        "style-src": ["'self'", "'unsafe-inline'", 'https:'],
        "connect-src": ["'self'", '*'],
      },
    }),
  );

  // CORS configuration with multi-origin support
  const corsOriginsEnv = configService.get<string>('CORS_ORIGIN', 'http://localhost:3001');
  const allowedOrigins = corsOriginsEnv.split(',').map((s) => s.trim());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS not allowed'), false);
    },
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

  // Global error filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // API prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation (only in development)
  if (configService.get('NODE_ENV') === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Gold Investment Platform API')
      .setDescription('Production-ready Gold Investment Platform API documentation')
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
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log(`Swagger documentation available at /${apiPrefix}/docs`);
  }

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  logger.log(`🚀 Gold Investment Platform API is running on port ${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});
