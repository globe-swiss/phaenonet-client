import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginSiteComponent } from './login-site.component';
import { LoginComponent } from './login.component';
import { LoggedOutComponent } from './logged-out.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    children: [
      { path: 'login', component: LoginSiteComponent },
      { path: 'logged-out', component: LoggedOutComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule {}
