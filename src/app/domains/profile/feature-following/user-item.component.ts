import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaybeIdLike } from '@core/core.model';
import { TranslatePipe } from '@ngx-translate/core';
import { PublicUser } from '@shared/models/public-user.model';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.scss'],
  imports: [RouterLink, TranslatePipe]
})
export class UserItemComponent {
  @Input() item: PublicUser & MaybeIdLike;
}
