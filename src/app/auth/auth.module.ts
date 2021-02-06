import { NgModule, Optional, SkipSelf } from '@angular/core';
import { throwIfAlreadyLoaded } from '../core/module-import-guard';
import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';

/**
 * The `AuthModule` is used to group authorization related services and components.
 */
@NgModule({
  imports: [],
  providers: [AuthService, AuthGuard]
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
