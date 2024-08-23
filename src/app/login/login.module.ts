import { NgModule } from '@angular/core';

import { LoggedOutComponent } from './logged-out.component';
import { LoginDialogComponent } from './login-dialog.component';
import { LoginFormComponent } from './login-form.component';
import { LoginRoutingModule } from './login-routing.module';
import { LoginSiteComponent } from './login-site.component';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { ResetPasswordComponent } from './reset-password.component';

@NgModule({
  imports: [
    LoginRoutingModule,
    LoginComponent,
    LoginDialogComponent,
    LoginFormComponent,
    LoginSiteComponent,
    LoggedOutComponent,
    ResetPasswordComponent,
    RegisterComponent
  ]
})
export class LoginModule {}
