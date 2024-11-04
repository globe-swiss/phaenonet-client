import { AsyncPipe, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { IndividualService } from '@app/domains/individual/individual.service'; // fixme
import { TranslateModule } from '@ngx-translate/core';
import { IndividualPhenophase } from '@shared/models/individual-phenophase.model';
import { PublicUser } from '@shared/models/public-user.model';
import { UserService } from '@shared/services/user.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ObservationItemComponent } from '../shared/observation-item.component';
import { UserItemComponent } from './user-item.component';

@Component({
  selector: 'app-follow-list',
  templateUrl: './follow-list.widget.html',
  styleUrls: ['./follow-list.widget.scss'],
  standalone: true,
  imports: [TranslateModule, NgFor, UserItemComponent, ObservationItemComponent, MatButton, RouterLink, AsyncPipe]
})
export class FollowListComponent implements OnInit {
  followedIndividuals$: Observable<IndividualPhenophase[]>;
  followedUsers$: Observable<PublicUser[]>;
  limit$ = new BehaviorSubject<number>(1);

  constructor(
    private individualService: IndividualService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.followedIndividuals$ = this.individualService.getIndividualPhenohases(
      this.userService.getFollowedIndividuals(this.limit$)
    );
    this.followedUsers$ = this.userService.getFollowedUsers(this.limit$);
  }

  showMore() {
    this.limit$.next(this.limit$.value + 50);
  }
}
