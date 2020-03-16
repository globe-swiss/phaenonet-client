import { NgModule, Optional, SkipSelf } from '@angular/core';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';
import { throwIfAlreadyLoaded } from '../core/module-import-guard';
import { UserService } from './user.service';

/**
 * The `AuthModule` is used to group authorization related services and components.
 */
@NgModule({
  imports: [],
  providers: [AuthService, AuthGuard, UserService]
})
export class AuthModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: AuthModule
  ) {
    throwIfAlreadyLoaded(parentModule, 'AuthModule');
  }
}
