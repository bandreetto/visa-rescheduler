import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NavigationService } from './navigation/navigation.service';
import { WebsiteActionsService } from './website-actions/website-actions.service';

@Module({
  imports: [ConfigModule],
  providers: [NavigationService, WebsiteActionsService],
  exports: [NavigationService, WebsiteActionsService],
})
export class VisaWebsiteModule {}
