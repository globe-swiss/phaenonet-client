import { Component, OnInit } from '@angular/core';
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
    protected router: Router
  ) {
    super(individualService, route, router);
  }

  ngOnInit(): void {
    super.ngOnInit();

    window.scrollTo(0, 0);

    if (this.route.snapshot.params.id === 'new') {
      this.navService.setLocation('Objekt erfassen');
      this.isNewIndividual = true;
    } else {
      this.navService.setLocation('Objekt bearbeiten');
      this.isNewIndividual = false;
    }
  }
}
