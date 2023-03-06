import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html'
})
export class LoginDialogComponent {
  constructor(private dialogRef: MatDialogRef<LoginDialogComponent>) {}

  onLoginSuccess(): void {
    this.dialogRef.close();
  }
}
