import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseDetailComponent } from '@core/components/base-detail.component';
import { AuthService } from '@core/services/auth.service';
import { NavService } from '@shared/components/nav.service';
import { Individual } from '@shared/models/individual.model';
import { MasterdataService } from '@shared/models/masterdata.service';
import { Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IndividualDescriptionButtonsComponent } from './feature-buttons/individual-buttons.widget';
import { IndividualDescriptionHeaderComponent } from './feature-description/individual-info.widget';
import { IndividualDescriptionBasicInfoComponent } from './feature-description/masterdata-info.component';
import { ObservationViewComponent } from './feature-observations/individual-observation.widget';
import { IndividualSubscriptionButtonComponent } from './feature-subscription/individual-subscription.widget';
import { IndividualService } from './individual.service';
import { IndividualHeaderComponent } from './shared/individual-header.component';

@Component({
  templateUrl: './individual.page.html',
  styleUrls: ['./individual.page.scss'],
  standalone: true,
  imports: [
    NgIf,
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
  isEditable$: Observable<boolean>;
  isOwn$: Observable<boolean>;
  isLoggedIn: boolean;

  constructor(
    private navService: NavService,
    protected route: ActivatedRoute,
    protected individualService: IndividualService,
    public dialog: MatDialog,
    private authService: AuthService,
    private masterdataService: MasterdataService,
    protected router: Router
  ) {
    super(individualService, route, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Objekt');

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
