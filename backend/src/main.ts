import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DbExceptionFilter } from './common/filters/db-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security headers ───────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      // Prevent browsers from MIME-sniffing
      noSniff: true,
      // Disable X-Powered-By
      hidePoweredBy: true,
      // Clickjacking protection
      frameguard: { action: 'deny' },
      // Force HTTPS in production
      hsts: process.env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      // Referrer policy
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // ── Cookie parser ──────────────────────────────────────────────────────────
  app.use(cookieParser());

  // ── Body size limit (default is 100kb; 1mb is ample for our forms) ─────────
  app.use(require('express').json({ limit: '1mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '1mb' }));

  // ── CORS: only allow configured origins ────────────────────────────────────
  const allowed = (process.env.FRONTEND_ORIGIN ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  app.enableCors({
    origin: (origin, cb) => {
      // Allow same-origin / non-browser requests in dev; restrict in production
      if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
      cb(new Error(`Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global exception filter ────────────────────────────────────────────────
  app.useGlobalFilters(new DbExceptionFilter());

  // ── Validation: strip unknown fields, coerce types ─────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip non-decorated properties
      forbidNonWhitelisted: true, // reject requests with extra fields
      transform: true,           // auto-coerce primitive types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
