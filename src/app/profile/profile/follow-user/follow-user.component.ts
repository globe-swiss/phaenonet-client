import { Component, Input, OnInit } from '@angular/core';
import { PublicUser } from '../../../open/public-user';

@Component({
  selector: 'app-follow-user',
  templateUrl: './follow-user.component.html',
  styleUrls: ['./follow-user.component.scss']
})
export class FollowUserComponent implements OnInit {
  constructor() {}
  @Input() item: PublicUser;

  ngOnInit(): void {}
}
