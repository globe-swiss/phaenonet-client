import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Observation } from '../observation/observation';
import { PhenophaseObservation } from '../observation/phenophase-observation';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'app-phenohase-dialog',
  styleUrls: ['./phenophase-dialog.component.scss'],
  templateUrl: 'phenophase-dialog.component.html',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatDialogTitle,
    TranslateModule,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    FormsModule,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    NgIf,
    MatSelect,
    MatOption,
    NgFor,
    MatDialogActions,
    MatDialogClose,
    AsyncPipe
  ]
})
export class PhenophaseDialogComponent {
  showTouchCalendar$: Observable<boolean>;

  originalDate: Observation['date'];
  originalComment: Observation['comment'];

  constructor(
    public dialogRef: MatDialogRef<PhenophaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PhenophaseObservation,
    private breakpointObserver: BreakpointObserver
  ) {
    const original = this.data.observation.getOrElse(null);
    if (original) {
      this.originalDate = original.date;
      this.originalComment = original.comment;
    }
    this.showTouchCalendar$ = this.breakpointObserver
      .observe('(max-height: 700px)')
      .pipe(map(result => result.matches));
  }

  close(): void {
    this.data.observation = this.data.observation.map(osb => {
      osb.date = this.originalDate;
      osb.comment = this.originalComment;
      return osb;
    });
    this.dialogRef.close(this.data);
  }

  deleteAndClose(): void {
    this.data.observation = this.data.observation.map(osb => {
      osb.date = null;
      osb.comment = null;
      return osb;
    });
    this.dialogRef.close();
  }
}
