import {
  Component,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { JsonPipe } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { UserChangePsw } from 'src/app/core/models/auth/user-password';
import { AuthService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  standalone: true,
  templateUrl: './change-password.component.html',
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
    JsonPipe,
    ReactiveFormsModule
],
})
export class ChangePasswordComponent {
  @Output() cancelChangePassword = new EventEmitter<void>();
  form: FormGroup;
  showLoader = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.form = this.fb.group({
      curretPassword: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    }, { validators: this.passwordMatchValidator });
  }

  get f() {
    return this.form.controls;
  }

  submit(): void {
    this.showLoader = true;
    const request: UserChangePsw = {
      password: this.form.value.curretPassword,
      newPassword: this.form.value.confirmPassword,
    };

    this.authService.changePassword(request)
    .pipe(finalize(() => this.showLoader = false))
    .subscribe({
      next: () => {
        this.notificationService.showAlert('Información', 'Su contraseña ha sido modificada.');
        this.cancel();
      },
      error: () => {
        this.notificationService.showAlert('Advertencia', 'La contraseña actual no es correcta.');
      }
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true }
      : null;
  }

  cancel(): void {
    this.cancelChangePassword.emit();
    this.form.reset();
  }
}
