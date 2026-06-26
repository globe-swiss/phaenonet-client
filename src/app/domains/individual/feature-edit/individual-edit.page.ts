import { Component, OnInit, inject } from '@angular/core';
import { BaseDetailComponent } from '@core/components/base-detail.component';
import { TitleService } from '@core/services/title.service';
import { TranslateModule } from '@ngx-translate/core';
import { Individual } from '@shared/models/individual.model';
import { IndividualService } from '@shared/services/individual.service';
import { IndividualEditViewComponent } from './individual-edit-form.widget';
import { IndividualEditHeaderComponent } from './individual-edit-header.widget';

@Component({
  templateUrl: './individual-edit.page.html',
  styleUrls: ['./individual-edit.page.scss'],
  imports: [TranslateModule, IndividualEditViewComponent, IndividualEditHeaderComponent]
})
export class IndividualEditComponent extends BaseDetailComponent<Individual> implements OnInit {
  private titleService = inject(TitleService);
  protected resourceService = inject(IndividualService);

  isNewIndividual: boolean;

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
