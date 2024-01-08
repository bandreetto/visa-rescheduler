import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VisaWebsiteEvent } from 'src/visa-website/contracts/enums';
import { onPageEvent } from 'src/visa-website/logic/listen-event';
import {
  authenticate,
  createNewPage,
  selectFirstGroup,
  selectRescheduleAction,
} from 'src/visa-website/logic/navigations';
import { Consumer } from './consumer/consumer';

@Module({
  imports: [ConfigModule],
  providers: [Consumer],
})
export class ReschedulerModule implements OnApplicationBootstrap {
  private logger = new Logger(ReschedulerModule.name);

  constructor(private readonly configService: ConfigService) {}

  async onApplicationBootstrap() {
    const newPage = await createNewPage();
    onPageEvent(newPage, VisaWebsiteEvent.NewAvailableScheduleDates, (dates) =>
      this.logger.log('Available reeschedule dates', dates),
    );
    const groupsPage = await authenticate(
      newPage,
      this.configService.get('VISA_WEBSITE_USERSNAME'),
      this.configService.get('VISA_WEBSITE_PASSWORD'),
    );
    const groupActionsPage = await selectFirstGroup(groupsPage);
    await selectRescheduleAction(groupActionsPage);
  }
}
