import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BaseDetailComponent } from '@core/components/base-detail.component';
import { AuthService } from '@core/services/auth.service';
import { TitleService } from '@core/services/title.service';
import { Individual } from '@shared/models/individual.model';
import { IndividualService } from '@shared/services/individual.service';
import { MasterdataService } from '@shared/services/masterdata.service';
import { Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IndividualDescriptionButtonsComponent } from './feature-buttons/individual-buttons.widget';
import { IndividualDescriptionHeaderComponent } from './feature-description/individual-info.widget';
import { IndividualDescriptionBasicInfoComponent } from './feature-description/masterdata-info.component';
import { IndividualHeaderComponent } from './feature-header/individual-header.component';
import { ObservationViewComponent } from './feature-observations/individual-observation.widget';
import { IndividualSubscriptionButtonComponent } from '@shared/components/feature-subscription/individual-subscription.widget';

@Component({
  templateUrl: './individual.page.html',
  styleUrls: ['./individual.page.scss'],
  imports: [
    IndividualHeaderComponent,
    IndividualSubscriptionButtonComponent,
    IndividualDescriptionHeaderComponent,
    IndividualDescriptionBasicInfoComponent,
    ObservationViewComponent,
    IndividualDescriptionButtonsComponent,
    AsyncPipe
  ]
})
export class IndividualDetailComponent extends BaseDetailComponent<Individual> implements OnInit {
  private titleService = inject(TitleService);
  protected resourceService = inject(IndividualService);
  dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private masterdataService = inject(MasterdataService);

  isEditable$: Observable<boolean>;
  isOwn$: Observable<boolean>;
  isLoggedIn: boolean;

  ngOnInit(): void {
    super.ngOnInit();
    this.titleService.setLocation('Objekt');

    window.scrollTo(0, 0);

    this.isLoggedIn = this.authService.authenticated();

    this.isOwn$ = this.detailSubject$.pipe(
      filter(individual => individual !== undefined),
      map(individual => this.authService.getUserId() === individual.user)
    );

    this.isEditable$ = combineLatest([this.detailSubject$, this.masterdataService.phenoYear$]).pipe(
      filter(individual => individual !== undefined),
      map(
        ([individual, phenoYear]) => this.authService.getUserId() === individual.user && individual.year === phenoYear
      )
    );
  }
}
