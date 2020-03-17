import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PublicUserService } from './public-user.service';

@NgModule({
  imports: [SharedModule],
  declarations: [],
  providers: [PublicUserService],
  exports: []
})
export class OpenModule {}
