import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AutoUpdateSalaireAfterNewOrUpdateItem } from './interceptors/autoUpdateSalaireAfterNewOrUpdateItem.interceptor';
import { UseModel } from './providers/useModel.service';
import { ManagerDbService } from './providers/managerDb.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options: CorsOptions = {
    origin: function (origin, callback) {
      const allowed = [
        /^https?:\/\/[^\.]+\.onrender\.com(\/.*)?$/gm,
        /^https?:\/\/[^\.]+\.gamma-paie\.com(\/.*)?$/gm,
        /^https?:\/\/[^\.]+\.localhost:3000(\/.*)?$/gm,
        /^https?:\/\/localhost:3000(\/.*)?$/gm,
      ].map((el) => el.test(origin));
      callback(
        null,
        allowed.some((el) => el == true),
      );
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Authorization',
      'X-TENANT-NAME',
      'X-Tenant-Name',
      'x-tenant-name',
    ],
    credentials: true,
  };

  app.enableCors(options);
  app.useGlobalPipes(new ValidationPipe());
  const useModel = app.get(UseModel);
  const managerDbService = app.get(ManagerDbService);
  app.useGlobalInterceptors(
    new AutoUpdateSalaireAfterNewOrUpdateItem(useModel, managerDbService),
  );
  await app.listen(process.env.PORT || 3030);
}

bootstrap();
