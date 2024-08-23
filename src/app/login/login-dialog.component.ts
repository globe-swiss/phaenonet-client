import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LoginFormComponent } from './login-form.component';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  standalone: true,
  imports: [LoginFormComponent]
})
export class LoginDialogComponent {
  constructor(private dialogRef: MatDialogRef<LoginDialogComponent>) {}

  onLoginSuccess(): void {
    this.dialogRef.close();
  }
}
