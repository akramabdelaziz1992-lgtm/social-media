import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as functions from 'firebase-functions';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const server = express();

export const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
    {
      cors: true,
      bodyParser: true,
    }
  );

  // Enable URL-encoded body parsing for Twilio webhooks
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // API prefix
  app.setGlobalPrefix('api');

  return app.init();
};

createNestServer(server)
  .then(() => console.log('🚀 Nest Ready for Firebase'))
  .catch(err => console.error('❌ Nest broken', err));

// Export the Firebase Function
export const api = functions.https.onRequest(server);
