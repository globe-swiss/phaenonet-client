import { NgModule } from '@angular/core';

import { IndividualDescriptionBasicInfoComponent } from './individual-description/individual-description-basic-info.component';
import { IndividualDescriptionButtonsComponent } from './individual-description/individual-description-buttons.component';
import { IndividualDescriptionHeaderComponent } from './individual-description/individual-description-header.component';
import { IndividualDetailComponent } from './individual-detail/individual-detail.component';
import { ObservationViewComponent } from './individual-detail/individual-observation-view/individual-observation-view.component';
import { IndividualEditViewComponent } from './individual-edit/individual-edit-view/individual-edit-view.component';
import { IndividualEditComponent } from './individual-edit/individual-edit.component';
import { IndividualHeaderGraphComponent } from './individual-header/individual-header-graph.component';
import { IndividualHeaderMapComponent } from './individual-header/individual-header-map.component';
import { IndividualHeaderComponent } from './individual-header/individual-header.component';
import { IndividualRoutingModule } from './individual-routing.module';
import { PhenophaseDialogComponent } from './phenophase-dialog.component';

@NgModule({
  imports: [
    IndividualRoutingModule,
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
    IndividualEditViewComponent
  ],
  exports: [IndividualHeaderComponent]
})
export class IndividualModule {}
