import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { StorageService } from './storage.service';

@NgModule({
  imports: [SharedModule],
  declarations: [],
  providers: [StorageService],
  exports: []
})
export class StorageModule {}
