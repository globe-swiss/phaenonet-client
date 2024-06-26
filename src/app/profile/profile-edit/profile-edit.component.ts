import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { BaseDetailComponent } from '../../core/base-detail.component';
import { LanguageService } from '../../core/language.service';
import { NavService } from '../../core/nav/nav.service';
import { PublicUserService } from '../../open/public-user.service';
import { User } from '../../profile/user';
import { UserService } from '../../profile/user.service';
import { ChangeEmailData } from './change-email-dialog/change-email-data';
import { ChangeEmailDialogComponent } from './change-email-dialog/change-email-dialog.component';
import { ChangePasswordData } from './change-password-dialog/change-password-data';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';

@Component({
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent extends BaseDetailComponent<User> implements OnInit, OnDestroy {
  editForm: UntypedFormGroup;
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
    this.editForm = new UntypedFormGroup({
      nickname: new UntypedFormControl('', { asyncValidators: this.publicUserService.uniqueNicknameValidator() }),
      firstname: new UntypedFormControl(''),
      lastname: new UntypedFormControl(''),
      locale: new UntypedFormControl('de-CH')
    });
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
      const user: User = { ...detail, ...this.editForm.value } as User;

      this.userService.upsert(user, this.detailId).subscribe(_ => {
        void this.router.navigate(['profile']);
      });
    });
  }

  cancel() {
    this.languageService.changeLocale(this.initialLanguage);
    void this.router.navigate(['profile']);
  }

  changePassword(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '615px',
      panelClass: 'phenonet-dialog-component'
    });

    dialogRef.afterClosed().subscribe((result: ChangePasswordData) => {
      if (result) {
        this.authService.changePassword(result.currentPassword, result.password);
      }
    });
  }

  changeEmail(): void {
    const dialogRef = this.dialog.open(ChangeEmailDialogComponent, {
      width: '615px',
      panelClass: 'phenonet-dialog-component'
    });

    dialogRef.afterClosed().subscribe((result: ChangeEmailData) => {
      if (result) {
        void this.authService.changeEmail(result.email, result.password).then(_ => (this.email = result.email));
      }
    });
  }

  changeLocale(event: MatSelectChange): void {
    this.languageService.changeLocale(event.value);
  }

  isOwner(): boolean {
    return this.authService.getUserId() === this.detailId;
  }
}
