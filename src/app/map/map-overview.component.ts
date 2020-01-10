import { Component, AfterViewChecked } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  templateUrl: './map-overview.component.html',
  styleUrls: ['./map-overview.component.scss']
})
export class MapOverviewComponent {
  center = { lat: 46.818188, lng: 8.227512 };
  zoom = 9;
  options = { mapTypeId: google.maps.MapTypeId.SATELLITE };
  constructor() {}
}
