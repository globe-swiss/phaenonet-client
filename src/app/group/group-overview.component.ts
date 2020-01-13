import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { NavService } from '../core/nav/nav.service';
import { AuthService } from '../auth/auth.service';
import { Observable, OperatorFunction, throwError, of, from } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Group } from './group';
import { GroupMember } from './group-member';
import { GroupService } from './group.service';

@Component({
  templateUrl: './group-overview.component.html',
  styleUrls: ['./group-overview.component.scss']
})
export class GroupOverviewComponent implements OnInit {
  groups: Observable<Group[]>;

  constructor(private navService: NavService, private groupService: GroupService) {}

  ngOnInit() {
    this.navService.setLocation('Gruppen');

    this.groups = this.groupService.getMyGroups();
  }
}
