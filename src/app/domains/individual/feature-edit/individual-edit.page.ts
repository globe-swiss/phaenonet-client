import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseDetailComponent } from '@core/components/base-detail.component';
import { TranslateModule } from '@ngx-translate/core';
import { NavService } from '@shared/components/nav.service';
import { Individual } from '@shared/models/individual.model';
import { IndividualService } from '../individual.service';
import { IndividualHeaderComponent } from '../shared/individual-header.component';
import { IndividualEditViewComponent } from './individual-edit-form.widget';

@Component({
  templateUrl: './individual-edit.page.html',
  styleUrls: ['./individual-edit.page.scss'],
  standalone: true,
  imports: [IndividualHeaderComponent, TranslateModule, IndividualEditViewComponent]
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
