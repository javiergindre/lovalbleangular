import { Component, inject } from '@angular/core';
import { CoreService } from 'src/app/core/services/core.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { AuthService } from 'src/app/core/services/auth.service';
import { SessionService } from 'src/app/core/services/session.service';
import { UserLogin } from 'src/app/core/models/auth/user-login';
import { NotificationService } from 'src/app/core/services/notification.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TenantService } from 'src/app/core/services/tenant.service';
import { switchMap, from, catchError } from 'rxjs';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
  ],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  tenantService = inject(TenantService);
  tenantSettings = this.tenantService.getTenantSettings();

  options = this.settings.getOptions();
  authService = inject(AuthService);
  sessionService = inject(SessionService);
  notificationService = inject(NotificationService);
  fb = inject(FormBuilder);
  router = inject(Router);
  form: FormGroup;
  showLoader: boolean = false;

  constructor(private settings: CoreService) {
    this.form = this.fb.group({
      username: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
    });
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    this.showLoader = true;

    const request: UserLogin = {
      username: this.form.value.username,
      password: this.form.value.password,
    };

    this.authService
      .login(request)
      .pipe(
        switchMap((response) => {
          this.sessionService.setToken(response);
          return from(this.sessionService.findAndSetSessionPromise());
        }),
        switchMap(() => this.sessionService.sessionReady$),
        switchMap(() => this.sessionService.getSelectedTenant()),
        switchMap((tenant) =>
          this.sessionService.defaultUrl$.pipe(
            switchMap((defaultUrl) => {
              return this.router.navigate([`${tenant.code}/${defaultUrl}`]);
            }),
            catchError(() => this.router.navigate(['']))
          )
        )
      )
      .subscribe({
        error: (error) => {
          console.error(error);
          this.notificationService.showAlert(error.error, 'Error!');
          this.showLoader = false;
        },
        complete: () => {
          this.showLoader = false;
        },
      });
  }

  // submit() {
  //   this.showLoader = true;
  //   const request: UserLogin = {
  //     username: this.form.value.username,
  //     password: this.form.value.password,
  //   };
  //   this.authService.login(request).subscribe({
  //     next: async (response) => {
  //       this.sessionService.setToken(response);
  //       await this.sessionService.findAndSetSessionPromise();

  //       this.sessionService.sessionReady$.subscribe({
  //         next: () => {
  //           this.sessionService.getSelectedTenant().subscribe({
  //             next: (tenant) => {
  //               this.sessionService.defaultUrl$.subscribe({
  //                 next: (defaultUrl) => {
  //                   this.router.navigate([tenant.code + '/' + defaultUrl]);
  //                 },
  //                 error: () => {
  //                   this.router.navigate(['']);
  //                 },
  //               });
  //             },
  //             error: () => {
  //               this.router.navigate(['']);
  //             },
  //           });
  //         },
  //         error: () => {
  //           this.router.navigate(['auth/error']);
  //         },
  //       });
  //     },
  //     complete: () => {
  //       this.showLoader = false;
  //     },
  //     error: (error) => {
  //       console.error(error);
  //       this.notificationService.showAlert(error.error, 'Error!');
  //       this.showLoader = false;
  //     },
  //   });
  // }
}
