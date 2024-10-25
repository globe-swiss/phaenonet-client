import { NgModule } from '@angular/core';

import { LoggedOutComponent } from './logged-out.component';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { ResetPasswordComponent } from './reset-password.component';

@NgModule({
  imports: [LoginComponent, LoginComponent, LoggedOutComponent, ResetPasswordComponent, RegisterComponent]
})
export class LoginModule {}
