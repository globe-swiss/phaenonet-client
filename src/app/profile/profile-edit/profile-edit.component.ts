import { first } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
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
  initialLanguage: string;

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
    this.initialLanguage = this.languageService.determineCurrentLang();
    this.navService.setLocation('Profil bearbeiten');

    this.detailSubject$.subscribe(detail => {
      this.editForm.reset(detail);
    });
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

  changeLocale(event: MatSelectChange) {
    this.languageService.changeLocale(event.value);
  }

  isOwner(): boolean {
    return this.authService.getUserId() === this.detailId;
  }
}
