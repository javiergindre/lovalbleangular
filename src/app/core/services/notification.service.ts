import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private _snackbar: MatSnackBar) { }

  showAlert(msg: string, type: string) {
    this._snackbar.open(msg, type, {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 10000,
    });
  }
}
