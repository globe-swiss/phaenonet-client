import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseDetailComponent } from '@core/components/base-detail.component';
import { TitleService } from '@core/services/title.service';
import { TranslateModule } from '@ngx-translate/core';
import { Individual } from '@shared/models/individual.model';
import { IndividualService } from '../../../shared/services/individual.service';
import { IndividualHeaderComponent } from '../shared/individual-header.component';
import { IndividualEditViewComponent } from './individual-edit-form.widget';
import { IndividualEditHeaderComponent } from './individual-edit-header.widget';

@Component({
  templateUrl: './individual-edit.page.html',
  styleUrls: ['./individual-edit.page.scss'],
  standalone: true,
  imports: [IndividualHeaderComponent, TranslateModule, IndividualEditViewComponent, IndividualEditHeaderComponent]
})
export class IndividualEditComponent extends BaseDetailComponent<Individual> implements OnInit {
  isNewIndividual: boolean;

  constructor(
    private titleService: TitleService,
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
      this.titleService.setLocation('Objekt erfassen');
      this.isNewIndividual = true;
    } else {
      this.titleService.setLocation('Objekt bearbeiten');
      this.isNewIndividual = false;
    }
  }
}
