import { Component, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseDetailComponent } from '../../core/base-detail.component';
import { NavService } from '../../core/nav/nav.service';
import { Individual } from '../individual';
import { IndividualService } from '../individual.service';

@Component({
  templateUrl: './individual-edit.component.html',
  styleUrls: ['./individual-edit.component.scss']
})
export class IndividualEditComponent extends BaseDetailComponent<Individual> implements OnInit {
  isNewIndividual: boolean;

  constructor(
    private navService: NavService,
    protected route: ActivatedRoute,
    private individualService: IndividualService,
    private analytics: AngularFireAnalytics,
    protected router: Router
  ) {
    super(individualService, route, router);
  }

  ngOnInit(): void {
    super.ngOnInit();

    window.scrollTo(0, 0);

    if (this.route.snapshot.params.id === 'new') {
      this.navService.setLocation('Objekt erfassen');
      this.analytics.logEvent('individual-create.view');
      this.isNewIndividual = true;
    } else {
      this.navService.setLocation('Objekt bearbeiten');
      this.analytics.logEvent('individual-modify.view');
      this.isNewIndividual = false;
    }
  }
}
