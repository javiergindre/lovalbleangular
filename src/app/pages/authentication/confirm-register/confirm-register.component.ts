import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmailValidation } from 'src/app/core/models/auth/user-register';
import { AuthService } from 'src/app/core/services/auth.service';
import { CoreService } from 'src/app/core/services/core.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SessionService } from 'src/app/core/services/session.service';
import { MaterialModule } from 'src/app/material.module';
import { Tenant } from 'src/environments/environment';
import { TenantService } from 'src/app/core/services/tenant.service';

@Component({
  selector: 'app-confirm-register',
  templateUrl: './confirm-register.component.html',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
  ],
})
export class ConfirmRegisterComponent implements OnInit {
  tenantService = inject(TenantService);
  authService = inject(AuthService);
  sessionService = inject(SessionService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  fb = inject(FormBuilder);
  form: FormGroup;
  showLoader: boolean = false;
  emailConfirmToken: string = '';
  username: string = '';
  personName: string = '';
  route = inject(ActivatedRoute);
  settings = inject(CoreService);
  options = this.settings.getOptions();
  tenantSettings: Tenant = this.tenantService.getTenantSettings();

  constructor() {
    this.form = this.fb.group(
      {
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),

        confirmPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
      },
      { validators: this.passwordMatchValidator }
    );
  }
  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.emailConfirmToken = params.get('emailconfirmtoken')!;
    this.username = params.get('username')!;
    this.personName = params.get('personname')!;
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    this.showLoader = true;
    const request: EmailValidation = {
      userName: this.username,
      emailConfirmationToken: this.emailConfirmToken,
      password: this.form.value.password,
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        this.router.navigate(['']);
      },
      complete: () => {
        this.showLoader = false;
      },
      error: (error) => {
        this.notificationService.showAlert(error.error, 'Aviso!');
        console.error(error);
        this.showLoader = false;
      },
    });
  }

  passwordMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  };
}
//http://localhost:4200/auth/register/confirm?emailconfirmtoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjA0ODMzNzB9.3qx2L-PC4YNM-X8Ky7OCsoqfZpQmernAduOqxfJLAqQ&username=juanpoux@gmail.com&personname=Poux,%20Juan
