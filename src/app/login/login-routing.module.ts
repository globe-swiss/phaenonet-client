import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoggedOutComponent } from './logged-out.component';
import { LoginSiteComponent } from './login-site.component';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { ResetPasswordComponent } from './reset-password.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    children: [
      { path: 'login', component: LoginSiteComponent },
      { path: 'logged-out', component: LoggedOutComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule {}
