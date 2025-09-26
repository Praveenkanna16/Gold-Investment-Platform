"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.use((0, helmet_1.default)());
    app.use(helmet_1.default.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            ...helmet_1.default.contentSecurityPolicy.getDefaultDirectives(),
            "default-src": ["'self'"],
            "img-src": ["'self'", 'data:', 'https:'],
            "script-src": ["'self'", "'unsafe-inline'", 'https:'],
            "style-src": ["'self'", "'unsafe-inline'", 'https:'],
            "connect-src": ["'self'", '*'],
        },
    }));
    const corsOriginsEnv = configService.get('CORS_ORIGIN', 'http://localhost:3001');
    const allowedOrigins = corsOriginsEnv.split(',').map((s) => s.trim());
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin))
                return callback(null, true);
            return callback(new Error('CORS not allowed'), false);
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const apiPrefix = configService.get('API_PREFIX', 'api/v1');
    app.setGlobalPrefix(apiPrefix);
    if (configService.get('NODE_ENV') === 'development') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Gold Investment Platform API')
            .setDescription('Production-ready Gold Investment Platform API documentation')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
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
//# sourceMappingURL=main.js.map