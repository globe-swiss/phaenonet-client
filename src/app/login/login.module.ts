import { NgModule } from '@angular/core';
import { OpenModule } from '../open/open.module';
import { SharedModule } from '../shared/shared.module';
import { LoggedOutComponent } from './logged-out.component';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { ResetPasswordComponent } from './reset-password.component';

@NgModule({
  imports: [
    SharedModule,
    LoginRoutingModule,
    OpenModule,
    LoginComponent,
    LoginComponent,
    LoggedOutComponent,
    ResetPasswordComponent,
    RegisterComponent
  ],
  providers: []
})
export class LoginModule {}
