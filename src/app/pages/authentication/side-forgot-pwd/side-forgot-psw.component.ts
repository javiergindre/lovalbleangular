import { Component, inject } from "@angular/core";
import { CoreService } from 'src/app/core/services/core.service';
import { 
    FormGroup,
    FormControl,
    Validators,
    FormsModule, 
    ReactiveFormsModule,
    FormBuilder } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { MaterialModule } from '../../../material.module';
import { UserForgotPsw } from 'src/app/core/models/auth/user-password';
import { NotificationService } from 'src/app/core/services/notification.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TenantService } from 'src/app/core/services/tenant.service';
import { CommonModule } from "@angular/common";
import { AuthService } from "src/app/core/services/auth.service";
import { SessionService } from "src/app/core/services/session.service";

@Component({
    selector: 'app-side-forgot-psw',
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        MatProgressBarModule,
    ],
    templateUrl: './side-forgot-psw.component.html',
})

export class AppSideForgotPswComponent {
    tenantService = inject(TenantService);
    tenantSettings = this.tenantService.getTenantSettings()

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
        email: new FormControl('', [Validators.required, Validators.email]),
        });
    }

    get f() { return this.form.controls; }

    submit() {
        this.showLoader = true;
        const request: UserForgotPsw = {
            userEmail: this.form.value.email,
        };

        this.authService.forgotPassword(request).subscribe({
            next: async () => {
                this.sessionService.sessionReady$.subscribe({
                    next: () => {
                        this.notificationService.showAlert(
                            'Información', 
                            'Se ha enviado un e-mail para restablecer su contraseña.'
                        );
                    },
                    error: () => {
                        this.notificationService.showAlert(
                            'Advertencia',
                            'El email proporcioando no es correcto.'
                          );
                      this.router.navigate(['auth/error']);
                    },
                  });
            },
            complete: () => {
                this.showLoader = false;
            },
            error: (error) => {
                console.error(error);
                this.notificationService.showAlert(error.error, 'Error!');
                this.showLoader = false;
            }
        })
    }
}