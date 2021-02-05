import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ObservationService } from './observation.service';

@NgModule({
  imports: [SharedModule],
  declarations: [],
  providers: [ObservationService],
  exports: []
})
export class ObservationModule {}
