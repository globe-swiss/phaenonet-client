import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { IndividualPhenophase } from '@shared/models/individual-phenophase.model';
import { IndividualService } from '@shared/services/individual.service'; // fixme
import { MasterdataService } from '@shared/services/masterdata.service';
import { gropupBy } from '@shared/utils/group-by';
import { Observable, ReplaySubject } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { ObservationItemComponent } from '../shared/observation-item.component';
import { ObservationSpeciesItemComponent } from './observation-species-item.component';

@Component({
  selector: 'app-observation-list',
  templateUrl: './observation-list.widget.html',
  styleUrls: ['./observation-list.widget.scss'],
  imports: [
    NgIf,
    TranslateModule,
    MatSelect,
    NgFor,
    MatOption,
    ObservationSpeciesItemComponent,
    ObservationItemComponent,
    MatButton,
    RouterLink,
    MatIcon,
    AsyncPipe
  ]
})
export class ObservationListComponent implements OnInit {
  @Input() userId: string;

  latestIndividualObservationsMap$: Observable<Array<[string, IndividualPhenophase[]]>>;

  selectedYear = new ReplaySubject<number>(1);

  constructor(
    private authService: AuthService,
    private individualService: IndividualService,
    private languageService: LanguageService,
    private masterdataService: MasterdataService
  ) {}

  avaiableYears() {
    return this.masterdataService.availableYears$;
  }

  ngOnInit(): void {
    this.masterdataService.phenoYear$.pipe(first()).subscribe(a => this.selectedYear.next(a));
    this.latestIndividualObservationsMap$ = this.selectedYear.pipe(
      switchMap(year =>
        this.individualService.getIndividualPhenohases(this.individualService.listByUserAndYear(this.userId, year))
      ),
      map(individuals => gropupBy(individuals, individual => individual.species.id)),
      map(individuals => Array.from(individuals)),
      map(individuals => individuals.sort((l, r) => this.languageService.sortTranslated(l[0], r[0])))
    );
  }

  isOwner(): boolean {
    return this.authService.getUserId() === this.userId;
  }

  selectYear(event: MatSelectChange): void {
    this.selectedYear.next(event.value as number);
  }
}
