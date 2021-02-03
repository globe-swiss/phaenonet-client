import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { BaseDetailComponent } from '../../core/base-detail.component';
import { NavService } from '../../core/nav/nav.service';
import { PublicUser } from '../../open/public-user';
import { PublicUserService } from '../../open/public-user.service';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends BaseDetailComponent<PublicUser> implements OnInit {
  constructor(
    private navService: NavService,
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
    this.navService.setLocation('Profil');
  }

  protected getDetailId(): Observable<string> {
    if (this.detailId == null) {
      return this.getRouteParam('id').pipe(
        catchError(_ => {
          return this.authService.getUserObservable().pipe(
            first(),
            map(_ => this.authService.getUserId())
          );
        })
      );
    } else {
      return of(this.detailId);
    }
  }

  isOwner(): boolean {
    return this.authService.getUserId() === this.detailId;
  }
}
