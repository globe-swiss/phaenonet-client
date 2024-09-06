import { LOGIN_URL } from './../app-routing.module';
import { Component, OnInit } from '@angular/core';
import { NavService } from '../core/nav/nav.service';

@Component({
  templateUrl: './logged-out.component.html',
  styleUrls: ['./logged-out.component.scss']
})
export class LoggedOutComponent implements OnInit {
  loginUrl = LOGIN_URL;

  constructor(private navService: NavService) {}

  ngOnInit(): void {
    this.navService.setLocation('Abgemeldet');
  }
}
