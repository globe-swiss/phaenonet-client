import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { AlertService, AlertMessage, Level } from './alert.service';
import { AlertComponent } from './alert.component';
import { TranslateService } from '@ngx-translate/core';
import { of, forkJoin, Observable } from 'rxjs';
import * as moment from 'moment';
import { formatShortDate, formatShortDateTime } from '../core/formatDate';

@Component({
  selector: 'app-snack-bar',
  templateUrl: 'app-snack-bar.component.html'
})
export class AppSnackBarComponent implements OnInit {
  constructor(
    public snackBar: MatSnackBar,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.alertService.latestMessage.subscribe(alertMessage =>
      this.snackBar.openFromComponent(AlertComponent, {
        announcementMessage: alertMessage.title,
        data: alertMessage,
        panelClass: ['alert', this.cssClass(alertMessage)],
        duration: alertMessage.duration
      })
    );
  }

  private cssClass(alertMessage: AlertMessage): string {
    switch (alertMessage.level) {
      case Level.INFO:
        return 'info';
      case Level.WARNING:
        return 'warning';
      case Level.ERROR:
        return 'error';
    }
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, undefined, { duration: 3000 });
  }
}
