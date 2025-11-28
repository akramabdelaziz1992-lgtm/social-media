import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
  });

  const configService = app.get(ConfigService);

  // Enable URL-encoded body parsing for Twilio webhooks
  app.use(require('express').urlencoded({ extended: true }));
  app.use(require('express').json());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Allow Twilio extra fields
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:3000',
    'https://almasar-frontend.vercel.app',
    configService.get('FRONTEND_URL'),
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        callback(null, true); // Allow all origins in production for now
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // API prefix
  app.setGlobalPrefix('api');

  // Health check endpoint (for Render)
  app.getHttpAdapter().get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'almasar-backend' 
    });
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('المسار الساخن API')
    .setDescription('مركز المحادثات الموحد - API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'المصادقة والتسجيل')
    .addTag('users', 'إدارة المستخدمين')
    .addTag('channels', 'إدارة القنوات')
    .addTag('conversations', 'إدارة المحادثات')
    .addTag('messages', 'الرسائل')
    .addTag('templates', 'القوالب')
    .addTag('auto-reply', 'الردود التلقائية')
    .addTag('webhooks', 'نقاط استقبال Webhooks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 4000;
  await app.listen(port, '0.0.0.0');

  console.log(`
  🚀 المسار الساخن Backend is running!
  📡 API: http://localhost:${port}/api
  📚 Swagger Docs: http://localhost:${port}/api/docs
  `);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
