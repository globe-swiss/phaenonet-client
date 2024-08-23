import { NgModule } from '@angular/core';

import { LoggedOutComponent } from './logged-out.component';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { ResetPasswordComponent } from './reset-password.component';

@NgModule({
  imports: [
    LoginRoutingModule,
    LoginComponent,
    LoginComponent,
    LoggedOutComponent,
    ResetPasswordComponent,
    RegisterComponent
  ]
})
export class LoginModule {}
