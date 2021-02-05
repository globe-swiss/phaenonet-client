import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { AlertMessage } from './alert.service';

@Component({
  templateUrl: 'alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) private alertMessage: AlertMessage) {}

  title(): string {
    return this.alertMessage.title;
  }

  message(): string[] {
    return this.alertMessage.message.split('\n');
  }
}
