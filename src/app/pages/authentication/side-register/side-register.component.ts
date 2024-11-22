import { Component, HostListener, inject } from '@angular/core';
import { CoreService } from 'src/app/core/services/core.service';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormBuilder,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterWithProvider } from 'src/app/core/models/auth/user-register';
import { AuthService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { CustomValidators } from 'src/app/core/helpers/custom-validators';
import { Tenant } from 'src/environments/environment';
import { TenantService } from 'src/app/core/services/tenant.service';

@Component({
  selector: 'app-side-register',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent {
  tenantService = inject(TenantService);
  options = this.settings.getOptions();
  fb = inject(FormBuilder);
  router = inject(Router);
  form: FormGroup;
  showLoader: boolean = false;
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  tenantSettings: Tenant = this.tenantService.getTenantSettings();

  constructor(private settings: CoreService) {
    this.form = this.fb.group(
      {
        providerCode: new FormControl('', [
          Validators.required,
          CustomValidators.providerCodeValidator()
        ]),
        userPersonCode: new FormControl('', [
          Validators.required,
          CustomValidators.userPersonCodeValidator()
        ]),
        userPersonFirstName: new FormControl('', [Validators.required]),
        userPersonLastName: new FormControl('', [Validators.required]),
        userEmail: new FormControl('', [Validators.required, Validators.email]),
        userEmailConfirm: new FormControl('', [
          Validators.required,
          Validators.email,
        ]),
      },
      { validators: this.emailMatchValidator }
    );
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.valid) {
      this.showLoader = true;
      const request: RegisterWithProvider = {
        providerCode: this.form.value.providerCode!,
        userPersonCode: this.form.value.userPersonCode,
        userPersonFirstName: this.form.value.userPersonFirstName,
        userPersonLastName: this.form.value.userPersonLastName,
        userEmail: this.form.value.userEmail,
      };

      this.authService.validateHealthProvider(request).subscribe({
        next: (response) => {
          if (response === 'Approved') {
            this.notificationService.showAlert(
              'Advertencia',
              'Usuario ya registrado, lo redirigiremos para que pueda ingresar con sus credenciales'
            );
          } else {
            this.notificationService.showAlert(
              'Información',
              'Se ha enviado un e-mail para corroborar su identidad'
            );
          }
          this.router.navigate(['']);
        },
        complete: () => {
          this.showLoader = false;
        },
        error: (error) => {
          this.notificationService.showAlert(error.error, 'Error');
          console.error(error);
          this.showLoader = false;
        },
      });
    }
  }

  emailMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const email = group.get('userEmail');
    const confirmEmail = group.get('userEmailConfirm');

    if (email && confirmEmail && email.value !== confirmEmail.value) {
      confirmEmail.setErrors({ emailMismatch: true });
      return { emailMismatch: true };
    }

    return null;
  };
}
