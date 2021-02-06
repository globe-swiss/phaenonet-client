import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IndividualPhenophase } from 'src/app/individual/individual-phenophase';
import { IndividualService } from 'src/app/individual/individual.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-follow-list',
  templateUrl: './follow-list.component.html',
  styleUrls: ['./follow-list.component.scss']
})
export class FollowListComponent implements OnInit {
  followedIndividuals$: Observable<IndividualPhenophase[]>;
  limit$ = new BehaviorSubject<number>(4);

  constructor(private individualService: IndividualService, private userService: UserService) {}

  ngOnInit(): void {
    this.followedIndividuals$ = this.individualService.getIndividualPhenohases(
      this.userService.getFollowedIndividuals(this.limit$)
    );
  }

  showMore() {
    this.limit$.next(this.limit$.value + 10);
  }
}
