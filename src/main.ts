import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as process from 'process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as Handlebars from 'handlebars';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('AskPanelFirst API')
    .setDescription('The backend API for AskPanelFirst.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-ui', app, document, {
    jsonDocumentUrl: 'swagger-ui/json',
  });

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  // Register all partials in the templates/partials directory
  console.log(__dirname);
  const partialsDir = path.join(
    __dirname,
    '../features/mail/templates/partials',
  );

  // Register all partials manually
  fs.readdirSync(partialsDir).forEach((file) => {
    const partial = fs.readFileSync(path.join(partialsDir, file), 'utf8');
    const partialName = path.basename(file, '.hbs'); // Use the file name as the partial name
    Handlebars.registerPartial(partialName, partial);
  });

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
