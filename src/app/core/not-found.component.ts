import { Component, AfterViewChecked, AfterContentChecked } from '@angular/core';
import { NavService } from './nav/nav.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements AfterContentChecked {
  constructor(private navService: NavService) {}

  ngAfterContentChecked(): void {
    this.navService.setLocation('error-404-title');
  }
}
