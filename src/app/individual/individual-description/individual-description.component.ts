import { Component, Input, OnInit } from '@angular/core';
import { firestore } from 'firebase/app';
import { Observable, ReplaySubject } from 'rxjs';
import { map, mergeAll, shareReplay } from 'rxjs/operators';
import { formatShortDate } from 'src/app/core/formatDate';
import { Species } from '../..//masterdata/species';
import { Description } from '../../masterdata/description';
import { Distance } from '../../masterdata/distance';
import { Exposition } from '../../masterdata/exposition';
import { Forest } from '../../masterdata/forest';
import { Habitat } from '../../masterdata/habitat';
import { Irrigation } from '../../masterdata/irrigation';
import { MasterdataService } from '../../masterdata/masterdata.service';
import { Phenophase } from '../../masterdata/phaenophase';
import { Shade } from '../../masterdata/shade';
import { PublicUserService } from '../../open/public-user.service';
import { Individual } from '../individual';
import Timestamp = firestore.Timestamp;

@Component({
  selector: 'app-individual-description',
  templateUrl: './individual-description.component.html',
  styleUrls: ['./individual-description.component.scss']
})
export class IndividualDescriptionComponent implements OnInit {
  @Input() individual: ReplaySubject<Individual>;
  @Input() isEditable: Observable<boolean>;
  @Input() individualId: string; // should be added to the individual by the resource service

  species: Observable<Species>;
  description: Observable<Description>;
  exposition: Observable<Exposition>;
  shade: Observable<Shade>;
  habitat: Observable<Habitat>;
  forest: Observable<Forest>;
  distance: Observable<Distance>;
  irrigation: Observable<Irrigation>;

  individualCreatorNickname: Observable<string>;

  lastPhenophase: Observable<Phenophase>;
  lastPhenophaseColor: Observable<string>;
  lastObservationDate: Observable<string>;

  constructor(
    private masterdataService: MasterdataService,
    private publicUserService: PublicUserService
  ) { }

  ngOnInit() {
    this.species = this.individual.pipe(map(i => this.masterdataService.getSpeciesValue(i.species)), mergeAll());
    this.description = this.individual.pipe(map(i => this.masterdataService.getDescriptionValue(i.description)), mergeAll());
    this.exposition = this.individual.pipe(map(i => this.masterdataService.getExpositionValue(i.exposition)), mergeAll());
    this.shade = this.individual.pipe(map(i => this.masterdataService.getShadeValue(i.shade)), mergeAll());
    this.habitat = this.individual.pipe(map(i => this.masterdataService.getHabitatValue(i.habitat)), mergeAll());
    this.forest = this.individual.pipe(map(i => this.masterdataService.getForestValue(i.forest)), mergeAll());
    this.distance = this.individual.pipe(map(i => this.masterdataService.getDistanceValue(i.less100)), mergeAll());
    this.irrigation = this.individual.pipe(map(i => this.masterdataService.getIrrigationValue(i.watering)), mergeAll());

    this.individualCreatorNickname = this.individual.pipe(
      map(i => this.getUserName(i)),
      mergeAll()
    );

    this.lastPhenophase = this.individual.pipe(map(i => this.getPhenophase(i)), mergeAll());
    this.lastPhenophaseColor = this.lastPhenophase.pipe(map(p => this.masterdataService.getColor(p.id)));
    this.lastObservationDate = this.individual.pipe(map(i => formatShortDate(i.last_observation_date.toDate())));
  }

  private getUserName(individual: Individual) {
    return this.publicUserService.get(individual.user).pipe(
      map(u => u.nickname),
      shareReplay()
    );
  }

  private getPhenophase(individual: Individual) {
    return this.masterdataService.getSpeciesValue(individual.species).pipe(
      map(species => this.masterdataService.getPhenophaseValue(species.id, individual.last_phenophase)),
      mergeAll()
    );
  }
}
