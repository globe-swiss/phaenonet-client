import { first } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/user';
import { UserService } from '../../auth/user.service';
import { BaseDetailComponent } from '../../core/base-detail.component';
import { LanguageService } from '../../core/language.service';
import { NavService } from '../../core/nav/nav.service';
import { PublicUserService } from '../../open/public-user.service';
import { ChangePasswordData } from '../change-password-dialog/change-password-data';
import { ChangePasswordDialogComponent } from '../change-password-dialog/change-password-dialog.component';
import { ChangeEmailDialogComponent } from '../change-email-dialog/change-email-dialog.component';
import { ChangeEmailData } from '../change-email-dialog/change-email-data';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent extends BaseDetailComponent<User> implements OnInit, OnDestroy {
  editForm = new FormGroup({
    nickname: new FormControl('', { asyncValidators: this.publicUserService.uniqueNicknameValidator() }),
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    locale: new FormControl('de-CH')
  });
  private subscriptions = new Subscription();
  private initialLanguage: string;
  email: string;

  constructor(
    private navService: NavService,
    protected router: Router,
    protected route: ActivatedRoute,
    private userService: UserService,
    private publicUserService: PublicUserService,
    public dialog: MatDialog,
    private languageService: LanguageService,
    private authService: AuthService
  ) {
    super(userService, route, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Profil bearbeiten');
    this.initialLanguage = this.languageService.determineCurrentLang();

    this.subscriptions.add(
      this.detailSubject$.subscribe(detail => {
        this.editForm.reset(detail);
        this.email = this.authService.getUserEmail();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  save() {
    this.detailSubject$.pipe(first()).subscribe(detail => {
      // merge the detail with the new values from the form
      const user: User = { ...detail, ...this.editForm.value };

      this.userService.upsert(user, this.detailId).subscribe(_ => {
        this.router.navigate(['profile']);
      });
    });
  }

  cancel() {
    this.languageService.changeLocale(this.initialLanguage);
    this.router.navigate(['profile']);
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

  changeEmail(): void {
    const dialogRef = this.dialog.open(ChangeEmailDialogComponent, {
      width: '615px'
    });

    dialogRef.afterClosed().subscribe((result: ChangeEmailData) => {
      if (result) {
        this.authService.changeEmail(result.email, result.password).then(_ => (this.email = result.email));
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
