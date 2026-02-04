import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      //Configuración global de validación
      whitelist: true, //Elimina propiedades no definidas en los DTOs
      forbidNonWhitelisted: true, //Lanza un error si hay propiedades no definidas
    }),
  );
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
