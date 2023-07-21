import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VisaWebsiteModule } from './visa-website/visa-website.module';

@Module({
  imports: [VisaWebsiteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
