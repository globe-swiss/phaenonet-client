import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { BaseDetailComponent } from '../../core/base-detail.component';
import { NavService } from '../../core/nav/nav.service';
import { MasterdataService } from '../../masterdata/masterdata.service';
import { Individual } from '../individual';
import { IndividualService } from '../individual.service';
import { NgIf, AsyncPipe } from '@angular/common';
import { IndividualHeaderComponent } from '../individual-header/individual-header.component';
import { IndividualSubscriptionButtonComponent } from '../../shared/subscription/individual-subscription-button/individual-subscription-button.component';
import { IndividualDescriptionHeaderComponent } from '../individual-description/individual-description-header.component';
import { IndividualDescriptionBasicInfoComponent } from '../individual-description/individual-description-basic-info.component';
import { ObservationViewComponent } from './individual-observation-view/individual-observation-view.component';
import { IndividualDescriptionButtonsComponent } from '../individual-description/individual-description-buttons.component';

@Component({
  templateUrl: './individual-detail.component.html',
  styleUrls: ['./individual-detail.component.scss'],
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
