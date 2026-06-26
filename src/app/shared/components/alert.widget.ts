import { Component, OnDestroy, OnInit, TemplateRef, viewChild, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService } from '@core/services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert',
  templateUrl: 'alert.widget.html',
  imports: []
})
export class AppSnackBarComponent implements OnInit, OnDestroy {
  snackBar = inject(MatSnackBar);
  private alertService = inject(AlertService);

  readonly alertSnackBar = viewChild.required<TemplateRef<unknown>>('alertSnackBar');

  title: string;
  message: string[];

  subscriptions = new Subscription();

  ngOnInit() {
    this.subscriptions.add(
      this.alertService.latestMessage.subscribe(alertMessage => {
        this.title = alertMessage.title;
        this.message = alertMessage.message.split('\n');
        this.snackBar.openFromTemplate(this.alertSnackBar(), {
          duration: alertMessage.duration
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, undefined, { duration: 3000 });
  }
}
