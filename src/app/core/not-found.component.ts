import { Component, OnInit } from '@angular/core';
import { MapCacheService } from '../map/map-cache.service';
import { NavService } from './nav/nav.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  constructor(private navService: NavService, private mapCacheService: MapCacheService) {}

  ngOnInit(): void {
    this.navService.setLocation('Hier ist etwas schiefgelaufen.');
    this.mapCacheService.clearCache(); // try to clear cache if clicked on deleted individual
  }
}
