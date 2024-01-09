import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { VisaWebsiteEvent } from 'src/visa-website/contracts/events';
import { NavigationService } from 'src/visa-website/navigation/navigation.service';
import { VisaWebsiteModule } from 'src/visa-website/visa-website.module';
import { WebsiteActionsService } from 'src/visa-website/website-actions/website-actions.service';
import { Consumer } from './consumer/consumer';

@Module({
  imports: [VisaWebsiteModule],
  providers: [Consumer],
})
export class ReschedulerModule implements OnApplicationBootstrap {
  private logger = new Logger(ReschedulerModule.name);

  constructor(
    private readonly navigationService: NavigationService,
    private readonly websiteActionsService: WebsiteActionsService,
  ) {}

  async onApplicationBootstrap() {
    const newPage = await this.navigationService.createNewPage();
    this.websiteActionsService.listenPageEvent(
      newPage,
      VisaWebsiteEvent.NewAvailableAppointmentDates,
      ({ payload }) => this.logger.log('Available reschedule dates', payload),
    );
    const groupsPage = await this.navigationService.authenticate(newPage);
    const groupActionsPage = await this.navigationService.selectFirstGroup(
      groupsPage,
    );
    await this.navigationService.selectRescheduleAction(groupActionsPage);
  }
}
