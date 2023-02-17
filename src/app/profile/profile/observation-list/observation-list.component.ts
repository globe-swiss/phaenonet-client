import { Component, Input, OnInit } from '@angular/core';
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select';
import { Observable, ReplaySubject } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { LanguageService } from 'src/app/core/language.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { AuthService } from '../../../auth/auth.service';
import { IndividualPhenophase } from '../../../individual/individual-phenophase';
import { IndividualService } from '../../../individual/individual.service';
import { gropupBy } from 'src/app/shared/group-by';

@Component({
  selector: 'app-observation-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.scss']
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
