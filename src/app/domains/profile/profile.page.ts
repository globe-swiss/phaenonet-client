import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseDetailComponent } from '@core/components/base-detail.component';
import { AuthService } from '@core/services/auth.service';
import { TitleService } from '@core/services/title.service';
import { PublicUser } from '@shared/models/public-user.model';
import { PublicUserService } from '@shared/services/public-user.service';
import { Observable } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';
import { ActivityComponent } from './feature-activity/activity.widget';
import { ProfileDetailsComponent } from './feature-details/profile-details.widget';
import { FollowListComponent } from './feature-following/follow-list.widget';
import { ObservationListComponent } from './feature-observations/observation-list.widget';
import { ProfilePublicComponent } from './feature-public-profile/profile-public.page';

@Component({
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    NgIf,
    ProfileDetailsComponent,
    ProfilePublicComponent,
    ObservationListComponent,
    FollowListComponent,
    ActivityComponent,
    AsyncPipe
  ]
})
export class ProfileComponent extends BaseDetailComponent<PublicUser> implements OnInit {
  constructor(
    private titleService: TitleService,
    protected route: ActivatedRoute,
    private publicUserService: PublicUserService,
    public dialog: MatDialog,
    private authService: AuthService,
    protected router: Router
  ) {
    super(publicUserService, route, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.titleService.setLocation('Profil');
  }

  protected getDetailId(): Observable<string> {
    return super.getDetailId().pipe(
      catchError(() =>
        // wait till user is loaded before geting uid (reload own profile page)
        this.authService.firebaseUser$.pipe(
          first(),
          map(() => this.authService.uid())
        )
      )
    );
  }

  isOwner(): boolean {
    return this.authService.uid() === this.detailId;
  }
}
