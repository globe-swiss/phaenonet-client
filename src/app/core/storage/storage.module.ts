import { NgModule } from '@angular/core';
import { StorageService } from './storage.service';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SharedModule],
  declarations: [],
  providers: [StorageService],
  exports: []
})
export class StorageModule {}
