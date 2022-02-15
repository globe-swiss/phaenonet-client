import { NgModule } from '@angular/core';
import { ActivityModule } from '../activity/activity.module';
import { StorageModule } from '../core/storage/storage.module';
import { MasterdataModule } from '../masterdata/masterdata.module';
import { ObservationModule } from '../observation/observation.module';
import { OpenModule } from '../open/open.module';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { IndividualDescriptionBasicInfoComponent } from './individual-description/individual-description-basic-info.component';
import { IndividualDescriptionButtonsComponent } from './individual-description/individual-description-buttons.component';
import { IndividualDescriptionHeaderComponent } from './individual-description/individual-description-header.component';
import { DetailHeaderComponent } from './individual-detail/individual-detail-header/individual-detail-header.component';
import { IndividualDetailComponent } from './individual-detail/individual-detail.component';
import { ObservationViewComponent } from './individual-detail/individual-observation-view/individual-observation-view.component';
import { GeoposService } from './individual-edit/individual-edit-header/geopos.service';
import { EditHeaderComponent } from './individual-edit/individual-edit-header/individual-edit-header.component';
import { IndividualEditViewComponent } from './individual-edit/individual-edit-view/individual-edit-view.component';
import { IndividualEditComponent } from './individual-edit/individual-edit.component';
import { IndividualRoutingModule } from './individual-routing.module';
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
    IndividualDescriptionHeaderComponent,
    IndividualDescriptionBasicInfoComponent,
    IndividualDescriptionButtonsComponent,
    ObservationViewComponent,
    EditHeaderComponent,
    IndividualEditViewComponent
  ],
  providers: [GeoposService],
  exports: [DetailHeaderComponent],
  entryComponents: [PhenophaseDialogComponent, ConfirmationDialogComponent]
})
export class IndividualModule {}
