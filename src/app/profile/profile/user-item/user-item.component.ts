import { Component, Input, OnInit } from '@angular/core';
import { PublicUser } from '../../../open/public-user';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.scss']
})
export class FollowUserComponent implements OnInit {
  constructor() {}
  @Input() item: PublicUser;

  ngOnInit(): void {}
}
