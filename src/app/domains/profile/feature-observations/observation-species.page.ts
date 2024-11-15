import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatOption } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TitleService } from '@core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IndividualPhenophase } from '@shared/models/individual-phenophase.model';
import { IndividualService } from '@shared/services/individual.service'; //fixme
import { MasterdataService } from '@shared/services/masterdata.service';
import { parseInt } from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ObservationItemComponent } from '../shared/observation-item.component';

class Data {
  year: number;
  species: string;
  speciesText: string;
  id: string;
  avaiableYears: number[];
}
@Component({
  templateUrl: './observation-species.page.html',
  styleUrls: ['./observation-species.page.scss'],
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    MatIcon,
    MatSelect,
    NgFor,
    MatOption,
    ObservationItemComponent,
    AsyncPipe,
    TranslateModule
  ]
})
export class ProfileSpeciesComponent implements OnInit {
  latestIndividualObservations$: Observable<IndividualPhenophase[]>;
  data$: Observable<Data>;

  constructor(
    private titleService: TitleService,
    protected route: ActivatedRoute,
    public dialog: MatDialog,
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    protected router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.data$ = combineLatest([
      this.route.paramMap,
      this.masterdataService.phenoYear$,
      this.masterdataService.availableYears$
    ]).pipe(
      map(([params, phenoYear, avaiableYears]) => {
        const species = params.get('species');
        const speciesText = this.translateService.instant(species) as string;

        const yearS = params.get('year');
        const yearP = parseInt(yearS, 10);
        const year = avaiableYears.includes(yearP) ? yearP : phenoYear;

        const id = params.get('id');

        this.titleService.setLocation('species');

        return { year, species, speciesText, id, avaiableYears };
      })
    );

    this.latestIndividualObservations$ = this.data$.pipe(
      switchMap(({ year, id, species }) => {
        return this.individualService
          .getIndividualPhenohases(this.individualService.listByUserAndSpecies(id, year, species.toUpperCase()))
          .pipe(map(individuals => individuals.sort((l, r) => l.individual.name.localeCompare(r.individual.name))));
      })
    );
  }

  async selectYear(event: MatSelectChange) {
    await this.router.navigate(['../../year', event.value as number], {
      relativeTo: this.route
    });
  }
}
