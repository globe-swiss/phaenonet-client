import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { none } from 'fp-ts/lib/Option';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, first, map, mergeMap, switchMap } from 'rxjs/operators';
import { Activity } from '../activity/activity';
import { ActivityService } from '../activity/activity.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../auth/user.service';
import { BaseDetailComponent } from '../core/base-detail.component';
import { NavService } from '../core/nav/nav.service';
import { IndividualPhenophase } from '../individual/individual-phenophase';
import { IndividualService } from '../individual/individual.service';
import { MasterdataService } from '../masterdata/masterdata.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { ObservationService } from '../observation/observation.service';
import { PublicUser } from '../open/public-user';
import { PublicUserService } from '../open/public-user.service';
import { User } from '../auth/user';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material';
import { LanguageService } from '../core/language.service';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';
import { ChangePasswordData } from './change-password-data';

@Component({
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent extends BaseDetailComponent<User> implements OnInit {
  editForm = new FormGroup({
    nickname: new FormControl('', { asyncValidators: this.publicUserService.uniqueNicknameValidator() }),
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    locale: new FormControl('de-CH')
  });

  constructor(
    private navService: NavService,
    private router: Router,
    protected route: ActivatedRoute,
    private userService: UserService,
    private publicUserService: PublicUserService,
    public dialog: MatDialog,
    private languageService: LanguageService,
    private authService: AuthService
  ) {
    super(userService, route);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Profil');

    this.detailSubject.subscribe(detail => {
      this.editForm.reset(detail);
    });
  }

  save() {
    this.detailSubject.subscribe(detail => {
      // merge the detail with the new values from the form
      const user: User = { ...detail, ...this.editForm.value };

      this.userService.upsert(user, this.detailId).subscribe(_ => {
        this.router.navigate(['profile']);
      });
    });
  }

  changePassword(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '615px'
    });

    dialogRef.afterClosed().subscribe((result: ChangePasswordData) => {
      if (result) {
        this.authService.changePassword(result.currentPassword, result.password);
      }
    });
  }

  changeLocale(event: MatSelectChange) {
    this.languageService.changeLocale(event.value);
  }

  isOwner(): boolean {
    return this.authService.getUserId() === this.detailId;
  }
}
