import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule);
  const defaultPort = await parseInt(process.env.PORT, 10) || 5000;
  const maxRetries = 6;
  let port = defaultPort;

  for(let i = 0; i < maxRetries; i++){
      try{
      await app.listen(port);
      logger.log(`Application connected on port ${port}`);
      break;
    }catch(error){
      logger.log(`Trying port ${port + 1}`)
      port += 1
    }
  }
}
bootstrap();
