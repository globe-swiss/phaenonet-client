import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { parseInt } from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IndividualPhenophase } from 'src/app/individual/individual-phenophase';
import { IndividualService } from 'src/app/individual/individual.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { BaseDetailComponent } from '../../core/base-detail.component';
import { NavService } from '../../core/nav/nav.service';
import { PublicUser } from '../../open/public-user';
import { PublicUserService } from '../../open/public-user.service';

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
export class ProfileSpeciesComponent extends BaseDetailComponent<PublicUser> implements OnInit {
  latestIndividualObservations$: Observable<IndividualPhenophase[]>;
  data$: Observable<Data>;

  constructor(
    private navService: NavService,
    protected route: ActivatedRoute,
    publicUserService: PublicUserService,
    public dialog: MatDialog,
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    protected router: Router,
    private translateService: TranslateService
  ) {
    super(publicUserService, route, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.data$ = combineLatest([
      this.route.paramMap,
      this.masterdataService.phenoYear$,
      this.masterdataService.availableYears$
    ]).pipe(
      map(([params, phenoYear, avaiableYears]) => {
        console.log('params', params);
        const species = params.get('species');
        const speciesText = this.translateService.instant(species) as string;

        const yearS = params.get('year');
        const yearP = parseInt(yearS, 10);
        const year = avaiableYears.includes(yearP) ? yearP : phenoYear;
        // const year = yearP > 2011 && yearP <= phenoYear ? yearP : phenoYear;

        const id = params.get('id');

        console.log('paramsT', { params, species, speciesText, year });
        this.navService.setLocation('Species - ' + speciesText);
        // this.species$.next(species);

        return { year, species, speciesText, id, avaiableYears };
      })
    );
    this.data$.subscribe(s => console.log('asdf', s));

    this.latestIndividualObservations$ = this.data$.pipe(
      switchMap(({ year, id, species }) => {
        return this.individualService
          .getIndividualPhenohases(this.individualService.listByUserAndSpecies(id, year, species.toUpperCase()))
          .pipe(map(individuals => individuals.sort((l, r) => l.individual.name.localeCompare(r.individual.name))));
      })
    );
  }

  selectYear(event: MatSelectChange): void {
    // this.selectedYear.next(event.value as number);
    // this.data$.pipe(first()).subscribe(data => {
    this.router
      .navigate(['../../year', event.value as number], {
        relativeTo: this.route
      })
      .then(
        v => console.log('Promise', v),
        e => console.log('Promise E', e)
      );
  }
}
