import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { BaseDetailComponent } from '../../core/base-detail.component';
import { NavService } from '../../core/nav/nav.service';
import { PublicUser } from '../../open/public-user';
import { PublicUserService } from '../../open/public-user.service';
import { UserService } from '../user.service';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends BaseDetailComponent<PublicUser> implements OnInit {
  constructor(
    private navService: NavService,
    protected route: ActivatedRoute,
    private publicUserService: PublicUserService,
    private userService: UserService,
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
    return super.getDetailId().pipe(
      catchError(() =>
        this.userService.user$.pipe(
          // TODO check??!?!
          first(),
          // load the user first to be sure firebase is logged in
          map(() => this.authService.getUserId())
        )
      )
    );
  }

  isOwner(): boolean {
    return this.authService.getUserId() === this.detailId;
  }
}
