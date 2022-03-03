import { Component, Input } from '@angular/core';
import { MaybeIdLike } from 'src/app/masterdata/masterdata-like';
import { PublicUser } from '../../../open/public-user';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.scss']
})
export class UserItemComponent {
  @Input() item: PublicUser & MaybeIdLike;
}
