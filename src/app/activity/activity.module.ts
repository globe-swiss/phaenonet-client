import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ActivityService } from './activity.service';

@NgModule({
  imports: [SharedModule],
  declarations: [],
  providers: [ActivityService],
  exports: []
})
export class ActivityModule {}
