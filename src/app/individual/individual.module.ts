import { NgModule } from '@angular/core';
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { ActivityModule } from '../activity/activity.module';
import { StorageModule } from '../core/storage/storage.module';
import { MasterdataModule } from '../masterdata/masterdata.module';
import { ObservationModule } from '../observation/observation.module';
import { OpenModule } from '../open/open.module';
import { SharedModule } from '../shared/shared.module';
import { IndividualConnectComponent } from './individual-connect/individual-connect.component';
import { IndividualDescriptionBasicInfoComponent } from './individual-description/individual-description-basic-info.component';
import { IndividualDescriptionButtonsComponent } from './individual-description/individual-description-buttons.component';
import { IndividualDescriptionHeaderComponent } from './individual-description/individual-description-header.component';
import { IndividualDetailComponent } from './individual-detail/individual-detail.component';
import { ObservationViewComponent } from './individual-detail/individual-observation-view/individual-observation-view.component';
import { IndividualEditViewComponent } from './individual-edit/individual-edit-view/individual-edit-view.component';
import { IndividualEditComponent } from './individual-edit/individual-edit.component';
import { GeoposService } from './individual-header/geopos.service';
import { IndividualHeaderGraphComponent } from './individual-header/individual-header-graph.component';
import { IndividualHeaderMapComponent } from './individual-header/individual-header-map.component';
import { IndividualHeaderComponent } from './individual-header/individual-header.component';
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
    StorageModule,
    NgxScannerQrcodeModule
  ],
  declarations: [
    IndividualEditComponent,
    IndividualDetailComponent,
    PhenophaseDialogComponent,
    IndividualDescriptionHeaderComponent,
    IndividualDescriptionBasicInfoComponent,
    IndividualDescriptionButtonsComponent,
    ObservationViewComponent,
    IndividualHeaderComponent,
    IndividualHeaderMapComponent,
    IndividualHeaderGraphComponent,
    IndividualEditViewComponent,
    IndividualConnectComponent
  ],
  providers: [GeoposService],
  exports: [IndividualHeaderComponent]
})
export class IndividualModule {}
