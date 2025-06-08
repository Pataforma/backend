import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, LogLevel } from '@nestjs/common';
import 'dotenv/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const isProduction = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;
  
  logger.log(`Iniciando aplicação em ambiente: ${isProduction ? 'produção' : 'desenvolvimento'}`);
  
  // Níveis de log conforme ambiente
  const logLevels: LogLevel[] = isProduction 
    ? ['error', 'warn', 'log'] 
    : ['error', 'warn', 'log', 'debug', 'verbose'];
  
  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }));
  
  app.enableCors({
    origin: isProduction ? process.env.FRONTEND_URL : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  
  await app.listen(port);
  logger.log(`Aplicação iniciada na porta ${port}`);
}

bootstrap();
