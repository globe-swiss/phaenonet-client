import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { MasterdataService } from '../../masterdata/masterdata.service';
import { Phenophase } from '../../masterdata/phaenophase';
import { Species } from '../../masterdata/species';
import { PublicUserService } from '../../open/public-user.service';
import { Individual } from '../individual';

@Component({
  selector: 'app-individual-description-header',
  templateUrl: './individual-description-header.component.html',
  styleUrls: ['./individual-description-header.component.scss']
})
export class IndividualDescriptionHeaderComponent implements OnInit {
  @Input() individual$: Observable<Individual>; // injected ReplaySubject

  species$: Observable<Species>;

  individualCreatorNickname$: Observable<string>;

  lastPhenophase$: Observable<Phenophase>;
  lastPhenophaseColor$: Observable<string>;

  isRanger$: Observable<boolean>;

  constructor(private masterdataService: MasterdataService, private publicUserService: PublicUserService) {}

  ngOnInit(): void {
    const publicUser$ = this.individual$.pipe(switchMap(i => this.publicUserService.get(i.user)));
    this.species$ = this.individual$.pipe(switchMap(i => this.masterdataService.getSpeciesValue(i.species)));

    this.individualCreatorNickname$ = publicUser$.pipe(map(u => u.nickname));

    const species$ = this.individual$.pipe(switchMap(i => this.masterdataService.getSpeciesValue(i.species)));
    this.lastPhenophase$ = combineLatest([this.individual$, species$]).pipe(
      switchMap(([i, s]) => this.masterdataService.getPhenophaseValue(s.id, i.last_phenophase))
    ); // undefined if non-existent
    // filter: lastPhenophase will be undefined when navigating to an individual without observation in the dropdown selection
    this.lastPhenophaseColor$ = this.lastPhenophase$.pipe(
      filter(p => p !== undefined),
      map(p => this.masterdataService.getColor(p.id))
    );

    this.isRanger$ = this.publicUserService.isRanger(publicUser$);
  }
}
