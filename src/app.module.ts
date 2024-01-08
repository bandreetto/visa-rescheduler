import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { VisaWebsiteModule } from './visa-website/visa-website.module';
import { ReschedulerModule } from './rescheduler/rescheduler.module';

@Module({
  imports: [
    VisaWebsiteModule,
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    ReschedulerModule,
  ],
})
export class AppModule {}
