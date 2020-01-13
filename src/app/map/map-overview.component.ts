import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { NavService } from '../core/nav/nav.service';

@Component({
  templateUrl: './map-overview.component.html',
  styleUrls: ['./map-overview.component.scss']
})
export class MapOverviewComponent implements OnInit {
  center = { lat: 46.818188, lng: 8.227512 };
  zoom = 9;
  options = { mapTypeId: google.maps.MapTypeId.SATELLITE };

  constructor(private navService: NavService) {}

  ngOnInit() {
    this.navService.setLocation('Karte');
  }
}
