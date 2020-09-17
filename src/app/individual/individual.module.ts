import { NgModule } from '@angular/core';
import { ActivityModule } from '../activity/activity.module';
import { StorageModule } from '../core/storage/storage.module';
import { MasterdataModule } from '../masterdata/masterdata.module';
import { ObservationModule } from '../observation/observation.module';
import { OpenModule } from '../open/open.module';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { IndividualDescriptionComponent } from './individual-description/individual-description.component';
import { DetailHeaderComponent } from './individual-detail/individual-detail-header/individual-detail-header.component';
import { IndividualDetailComponent } from './individual-detail/individual-detail.component';
import { GeoposService } from './individual-edit/individual-edit-header/geopos.service';
import { EditHeaderComponent } from './individual-edit/individual-edit-header/individual-edit-header.component';
import { IndividualEditViewComponent } from './individual-edit/individual-edit-view/individual-edit-view.component';
import { IndividualEditComponent } from './individual-edit/individual-edit.component';
import { ObservationViewComponent } from './individual-detail/individual-observation-view/individual-observation-view.component';
import { IndividualRoutingModule } from './individual-routing.module';
import { SubscriptionBarComponent } from './individual-detail/individual-subscription/individual-subscription.component';
import { IndividualService } from './individual.service';
import { PhenophaseDialogComponent } from './phenophase-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    IndividualRoutingModule,
    MasterdataModule,
    ObservationModule,
    ActivityModule,
    OpenModule,
    StorageModule
  ],
  declarations: [
    IndividualEditComponent,
    IndividualDetailComponent,
    PhenophaseDialogComponent,
    DetailHeaderComponent,
    SubscriptionBarComponent,
    IndividualDescriptionComponent,
    ObservationViewComponent,
    EditHeaderComponent,
    IndividualEditViewComponent
  ],
  providers: [IndividualService, GeoposService],
  exports: [DetailHeaderComponent, SubscriptionBarComponent],
  entryComponents: [PhenophaseDialogComponent, ConfirmationDialogComponent]
})
export class IndividualModule {}
