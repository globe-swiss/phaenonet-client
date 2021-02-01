import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { LoginFormComponent } from './login-form.component';
import { LoginSiteComponent } from './login-site.component';
import { LoginDialogComponent } from './login-dialog.component';
import { LoggedOutComponent } from './logged-out.component';
import { ResetPasswordComponent } from './reset-password.component';
import { RegisterComponent } from './register.component';
import { OpenModule } from '../open/open.module';

@NgModule({
  imports: [SharedModule, LoginRoutingModule, OpenModule],
  declarations: [
    LoginComponent,
    LoginDialogComponent,
    LoginFormComponent,
    LoginSiteComponent,
    LoggedOutComponent,
    ResetPasswordComponent,
    RegisterComponent
  ],
  providers: [],
  entryComponents: [LoginDialogComponent]
})
export class LoginModule {}
