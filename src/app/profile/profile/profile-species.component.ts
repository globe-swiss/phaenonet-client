import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { parseInt } from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IndividualPhenophase } from 'src/app/individual/individual-phenophase';
import { IndividualService } from 'src/app/individual/individual.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { NavService } from '../../core/nav/nav.service';

class Data {
  year: number;
  species: string;
  speciesText: string;
  id: string;
  avaiableYears: number[];
}
@Component({
  templateUrl: './profile-species.component.html',
  styleUrls: ['./profile-species.component.scss']
})
export class ProfileSpeciesComponent implements OnInit {
  latestIndividualObservations$: Observable<IndividualPhenophase[]>;
  data$: Observable<Data>;

  constructor(
    private navService: NavService,
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

        this.navService.setLocation('species');

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
