import { Component, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { BaseDetailComponent } from '../../core/base-detail.component';
import { NavService } from '../../core/nav/nav.service';
import { MasterdataService } from '../../masterdata/masterdata.service';
import { Individual } from '../individual';
import { IndividualService } from '../individual.service';

@Component({
  templateUrl: './individual-detail.component.html',
  styleUrls: ['./individual-detail.component.scss']
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
    private analytics: AngularFireAnalytics,
    private masterdataService: MasterdataService,
    protected router: Router
  ) {
    super(individualService, route, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Objekt');

    window.scrollTo(0, 0);

    this.isLoggedIn = this.authService.isLoggedIn();

    this.isEditable$ = this.detailSubject$.pipe(
      filter(individual => individual !== undefined),
      map(
        individual =>
          this.authService.getUserId() === individual.user && individual.year === this.masterdataService.getPhenoYear()
      )
    );

    this.isOwn$ = this.detailSubject$.pipe(
      filter(individual => individual !== undefined),
      map(individual => this.authService.getUserId() === individual.user)
    );

    this.detailSubject$
      .pipe(
        first(),
        filter(individual => individual !== undefined)
      )
      .subscribe(detail => {
        this.analytics.logEvent('individual.view', {
          own: this.authService.getUserId() === detail.user,
          current: detail.year === this.masterdataService.getPhenoYear(),
          year: detail.year,
          species: detail.species
        });
      });
  }
}
