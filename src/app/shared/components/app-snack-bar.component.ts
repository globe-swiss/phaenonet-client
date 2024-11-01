import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AlertMessage, AlertService, Level } from '@shared/services/alert.service';
import { AlertComponent } from './alert.component';

@Component({
  selector: 'app-snack-bar',
  templateUrl: 'app-snack-bar.component.html',
  standalone: true
})
export class AppSnackBarComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  constructor(
    public snackBar: MatSnackBar,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.alertService.latestMessage.subscribe(alertMessage =>
        this.snackBar.openFromComponent(AlertComponent, {
          announcementMessage: alertMessage.title,
          data: alertMessage,
          panelClass: ['alert', this.cssClass(alertMessage)],
          duration: alertMessage.duration
        })
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
