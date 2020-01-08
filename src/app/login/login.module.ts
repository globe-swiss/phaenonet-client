import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { LoginFormComponent } from './login-form.component';
import { LoginSiteComponent } from './login-site.component';
import { LoginDialogComponent } from './login-dialog.component';
import { LoggedOutComponent } from './logged-out.component';

@NgModule({
  imports: [SharedModule, LoginRoutingModule],
  declarations: [LoginComponent, LoginDialogComponent, LoginFormComponent, LoginSiteComponent, LoggedOutComponent],
  providers: [],
  entryComponents: [LoginDialogComponent]
})
export class LoginModule {}
