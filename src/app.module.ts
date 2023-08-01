import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VisaWebsiteModule } from './visa-website/visa-website.module';

@Module({
  imports: [VisaWebsiteModule, ConfigModule.forRoot()],
})
export class AppModule {}
