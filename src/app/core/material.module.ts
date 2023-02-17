import { NgModule } from '@angular/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { DateAdapter, MatDateFormats, MatNativeDateModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { DatetimeAdapter, MatDatetimepickerModule } from '@mat-datetimepicker/core';
import { MatMomentDatetimeModule } from '@mat-datetimepicker/moment';
import { AppMomentDateAdapter, AppMomentDatetimeAdapter } from './app-moment-date-adapter';

@NgModule({
  imports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatDatetimepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatListModule,
    MatSidenavModule,
    MatButtonToggleModule
  ],
  providers: [
    { provide: DateAdapter, useClass: AppMomentDateAdapter },
    { provide: DatetimeAdapter, useClass: AppMomentDatetimeAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'l'
        },
        display: {
          dateInput: 'L',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY'
        }
      } as MatDateFormats
    }
  ],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatDatetimepickerModule,
    MatMomentDatetimeModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatListModule,
    MatSidenavModule,
    MatButtonToggleModule
  ]
})
export class MaterialModule {}
