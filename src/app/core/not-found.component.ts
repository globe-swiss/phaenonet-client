import { Component, AfterViewChecked, AfterContentChecked, OnInit } from '@angular/core';
import { NavService } from './nav/nav.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  constructor(private navService: NavService) {}

  ngOnInit(): void {
    this.navService.setLocation('error-404-title');
  }
}
