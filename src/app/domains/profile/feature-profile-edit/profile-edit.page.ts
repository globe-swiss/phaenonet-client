import { NgIf } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseDetailComponent } from '@core/components/base-detail.component';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { NavService } from '@shared/components/nav.service';
import { PhenonetUser } from '@shared/models/user.model';
import { PublicUserService } from '@shared/services/public-user.service';
import { UserService } from '@shared/services/user.service';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { ChangeEmailDialogComponent } from './change-email-dialog.component';
import { ChangeEmailData } from './change-email.model';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';
import { ChangePasswordData } from './change-password.model';

@Component({
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatIcon,
    MatSuffix,
    MatSelect,
    MatOption,
    MatButton
  ]
})
export class ProfileEditComponent extends BaseDetailComponent<PhenonetUser> implements OnInit, OnDestroy {
  editForm: FormGroup<{
    nickname: FormControl<string>;
    firstname: FormControl<string>;
    lastname: FormControl<string>;
    locale: FormControl<string>;
  }>;
  private subscriptions = new Subscription();
  private initialLanguage: string;
  email: Signal<string>;
  formInitialized: WritableSignal<boolean> = signal(false);

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
    this.editForm = new FormGroup({
      nickname: new FormControl('', {
        asyncValidators: this.publicUserService.uniqueNicknameValidator(this.userService.user()?.nickname)
      }),
      firstname: new FormControl(''),
      lastname: new FormControl(''),
      locale: new FormControl('de-CH')
    });

    // user will be initialy undefined if page is loaded from URL,
    // updates validator once the user is set - enabling to save the page entering the current username
    effect(() => {
      this.editForm
        .get('nickname')
        .setAsyncValidators(this.publicUserService.uniqueNicknameValidator(this.userService.user()?.nickname));
      this.editForm.get('nickname')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Profil bearbeiten');
    this.initialLanguage = this.languageService.determineCurrentLang();
    this.email = this.authService.email;

    this.subscriptions.add(
      this.detailSubject$.subscribe(detail => {
        this.editForm.reset(detail);
        this.formInitialized.set(true);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  save() {
    this.detailSubject$.pipe(first()).subscribe(detail => {
      // merge the detail with the new values from the form
      const user: PhenonetUser = { ...detail, ...this.editForm.value } as PhenonetUser;

      this.userService.upsert(user, this.detailId).subscribe(() => {
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
        void this.authService.changePassword(result.currentPassword, result.password);
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
        void this.authService.changeEmail(result.email, result.password);
      }
    });
  }

  changeLocale(event: MatSelectChange): void {
    this.languageService.changeLocale(event.value);
  }

  isOwner(): boolean {
    return this.authService.uid() === this.detailId;
  }
}
