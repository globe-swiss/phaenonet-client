import { Component, Input } from '@angular/core';
import { MaybeIdLike } from 'src/app/masterdata/masterdata-like';
import { PublicUser } from '../../../open/public-user';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.scss'],
  standalone: true,
  imports: [RouterLink, TranslateModule]
})
export class UserItemComponent {
  @Input() item: PublicUser & MaybeIdLike;
}
