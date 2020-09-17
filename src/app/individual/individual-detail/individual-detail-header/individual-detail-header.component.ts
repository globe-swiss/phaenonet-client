import { Component, Input, OnInit } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map, mergeAll, filter } from 'rxjs/operators';
import { MasterdataService } from '../../../masterdata/masterdata.service';
import { Individual } from '../../individual';
import { IndividualService } from '../../individual.service';

@Component({
  selector: 'app-individual-detail-header',
  templateUrl: './individual-detail-header.component.html',
  styleUrls: ['./individual-detail-header.component.scss']
})
export class DetailHeaderComponent implements OnInit {
  @Input() individual$: ReplaySubject<Individual>;

  zoom = 13;
  options: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    draggable: false,
    minZoom: 8
  };
  markerOptions$: Observable<google.maps.MarkerOptions>;
  center$: Observable<google.maps.LatLngLiteral>;
  geopos$: Observable<google.maps.LatLngLiteral>;

  imageUrl$: Observable<string | void>;

  constructor(private individualService: IndividualService, private masterdataService: MasterdataService) {}

  ngOnInit() {
    this.geopos$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => i.geopos)
    );
    this.center$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => i.geopos)
    );
    this.imageUrl$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.individualService.getImageUrl(i, true)),
      mergeAll()
    );
    this.markerOptions$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(
        i =>
          ({
            draggable: false,
            icon: this.masterdataService.individualToIcon(i)
          } as google.maps.MarkerOptions)
      )
    );
  }
}
