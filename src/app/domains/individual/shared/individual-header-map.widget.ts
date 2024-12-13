import { AsyncPipe, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { Individual } from '@shared/models/individual.model';
import { MasterdataService } from '@shared/services/masterdata.service';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, map, mergeAll } from 'rxjs/operators';
import { IndividualService } from '../../../shared/services/individual.service';

@Component({
  selector: 'app-individual-header-map',
  templateUrl: './individual-header-map.widget.html',
  styleUrls: ['./individual-header-map.widget.scss'],
  standalone: true,
  imports: [GoogleMap, MapMarker, NgIf, AsyncPipe]
})
export class IndividualHeaderMapComponent implements OnInit {
  @Input() individual$: ReplaySubject<Individual>;

  mapOptions: google.maps.MapOptions;
  markerOptions$: Observable<google.maps.MarkerOptions>;
  center$: Observable<google.maps.LatLngLiteral>;

  imageUrl$: Observable<string>;

  constructor(
    private individualService: IndividualService,
    private masterdataService: MasterdataService
  ) {}

  ngOnInit(): void {
    this.mapOptions = {
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      minZoom: 8,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      draggable: false
    };

    this.markerOptions$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(
        i =>
          ({
            clickable: false,
            icon: this.masterdataService.individualToIcon(i)
          }) as google.maps.MarkerOptions
      )
    );

    this.center$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => i.geopos)
    );

    this.imageUrl$ = this.individual$.pipe(
      filter(individual => individual !== undefined),
      map(individual => this.individualService.getImageUrl(individual, true)),
      mergeAll()
    );
  }
}
