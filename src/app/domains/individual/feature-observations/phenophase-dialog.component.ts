import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FieldValue } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Observation } from '@shared/models/observation.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PhenophaseObservation } from '../shared/individual.model';

@Component({
  selector: 'app-phenohase-dialog',
  styleUrls: ['./phenophase-dialog.component.scss'],
  templateUrl: 'phenophase-dialog.component.html',
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
    MatSelect,
    MatOption,
    MatDialogActions,
    MatDialogClose,
    AsyncPipe
  ]
})
export class PhenophaseDialogComponent {
  get observationComment(): string | FieldValue | null {
    return this.data.observation?.comment || null;
  }

  set observationComment(value: string | FieldValue | null) {
    if (this.data.observation) {
      this.data.observation.comment = value;
    }
  }

  setObservationDate(date: Date): void {
    if (!this.data.observation) {
      this.data.observation = {} as Observation;
    }
    this.data.observation.date = date;
  }
  showTouchCalendar$: Observable<boolean>;

  originalDate: Observation['date'];
  originalComment: Observation['comment'];

  constructor(
    public dialogRef: MatDialogRef<PhenophaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PhenophaseObservation,
    private breakpointObserver: BreakpointObserver
  ) {
    const original = this.data.observation;
    if (original) {
      this.originalDate = original.date;
      this.originalComment = original.comment;
    }
    this.showTouchCalendar$ = this.breakpointObserver
      .observe('(max-height: 700px)')
      .pipe(map(result => result.matches));
  }

  close(): void {
    if (this.data.observation) {
      this.data.observation.date = this.originalDate;
      this.data.observation.comment = this.originalComment;
    }
    this.dialogRef.close(this.data);
  }

  deleteAndClose(): void {
    if (this.data.observation) {
      this.data.observation.date = null;
      this.data.observation.comment = null;
    }
    this.dialogRef.close();
  }
}
