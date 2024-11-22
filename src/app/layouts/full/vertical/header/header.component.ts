import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  inject,
  OnInit,
  input,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatDialog } from '@angular/material/dialog';
import { JsonPipe } from '@angular/common';
import { firstValueFrom, Observable } from 'rxjs';
import { CoreService } from 'src/app/core/services/core.service';
import { SessionService } from 'src/app/core/services/session.service';
import { TenantService } from 'src/app/core/services/tenant.service';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  MenuItemDto,
  Session,
  TenantItem,
} from 'src/app/core/models/menu/session';
import { navItems } from '../sidebar/sidebar-data';
import { MatMenuTrigger } from '@angular/material/menu';
import { UserChangePsw } from 'src/app/core/models/auth/user-password';
import { AuthService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SkinService } from 'src/app/core/services/skin.service';
import { LoadingStateService } from 'src/app/core/services/loading-state.service';
import { ChangePasswordComponent } from './change-password/change-password.component';

interface Notifications {
  id: number;
  img: string;
  title: string;
  subtitle: string;
}

interface Profiledd {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
    JsonPipe,
    ReactiveFormsModule,
    ChangePasswordComponent,
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
  @Output() changeNavItems = new EventEmitter<MenuItemDto>();
  @ViewChild(MatMenuTrigger) profileMenuTrigger: MatMenuTrigger | undefined;

  showInitials = false;
  initials: string;
  form: FormGroup;
  session: Session;
  selectedLanguage: any;
  menuItems = input<MenuItemDto[]>();
  changePsw: boolean = false;
  showLoader: boolean = false;
  public skinDev: boolean = false;

  // Services
  private fb = inject(FormBuilder);
  private vsidenav = inject(CoreService);
  private dialog = inject(MatDialog);
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private tenantService = inject(TenantService);
  private notificationService = inject(NotificationService);
  private skinService = inject(SkinService);
  private loadingStateService = inject(LoadingStateService);

  // Observables
  personName: Observable<string>;
  userName: Observable<string>;
  tenants: Observable<TenantItem[]> = this.sessionService.getTenants();
  selectedTenant: Observable<TenantItem> =
    this.sessionService.getSelectedTenant();

  // Data
  // notifications: Notifications[] = [
  //   {
  //     id: 1,
  //     img: '/assets/images/profile/user-1.jpg',
  //     title: 'Roman Joined the Team!',
  //     subtitle: 'Congratulate him sf',
  //   },
  //   {
  //     id: 2,
  //     img: '/assets/images/profile/user-2.jpg',
  //     title: 'New message received',
  //     subtitle: 'Salma sent you new message',
  //   },
  //   {
  //     id: 3,
  //     img: '/assets/images/profile/user-3.jpg',
  //     title: 'New Payment received',
  //     subtitle: 'Check your earnings',
  //   },
  //   {
  //     id: 4,
  //     img: '/assets/images/profile/user-4.jpg',
  //     title: 'Jolly completed tasks',
  //     subtitle: 'Assign her new tasks',
  //   },
  //   {
  //     id: 5,
  //     img: '/assets/images/profile/user-5.jpg',
  //     title: 'Roman Joined thed Team!',
  //     subtitle: 'Congratulate him',
  //   },
  // ];

  profiledd: Profiledd[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-account.svg',
      title: 'My Profile',
      subtitle: 'Account Settings',
      link: '/',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-inbox.svg',
      title: 'My Inbox',
      subtitle: 'Messages & Email',
      link: '/',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-tasks.svg',
      title: 'My Tasks',
      subtitle: 'To-do and Daily Tasks',
      link: '/',
    },
  ];

  // public languages: any[] = [
  //   {
  //     language: 'English',
  //     code: 'en',
  //     type: 'US',
  //     icon: '/assets/images/flag/icon-flag-en.svg',
  //   },
  //   {
  //     language: 'Español',
  //     code: 'es',
  //     icon: '/assets/images/flag/icon-flag-es.svg',
  //   },
  //   {
  //     language: 'Français',
  //     code: 'fr',
  //     icon: '/assets/images/flag/icon-flag-fr.svg',
  //   },
  //   {
  //     language: 'German',
  //     code: 'de',
  //     icon: '/assets/images/flag/icon-flag-de.svg',
  //   },
  // ];

  constructor() {
    this.form = this.fb.group(
      {
        curretPassword: new FormControl('', [Validators.required]),
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

    // Initialize selectedLanguage
    // this.selectedLanguage =
    //   this.languages.find((lang) => lang.code === 'en') || this.languages[0];

    // Initialize skinService
    this.skinService.skinDev$.subscribe((skinDev) => {
      this.skinDev = skinDev;
    });
  }

  ngOnInit(): void {
    this.personName = this.sessionService.personName$;
    this.userName = this.sessionService.userName$;

    this.showInitials = true;
    this.personName.subscribe((res) => this.createInitials(res));
  }

  get f() {
    return this.form.controls;
  }

  createInitials(personName: string | null): void {
    if (!personName) {
      this.initials = '';
      return;
    }

    const parts = personName.split(/[\s,]+/).filter((part) => part.length > 0);
    let initials = '';

    for (let i = 0; i < parts.length; i++) {
      if (initials.length < 2) {
        initials += parts[i].charAt(0).toUpperCase();
      }
    }

    if (initials.length < 2) {
      initials = personName
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 2)
        .toUpperCase();
    }

    this.initials = initials;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      // Handle dialog result
    });
  }

  changeLanguage(lang: any): void {
    this.selectedLanguage = lang;
  }

  async changeTenant(tenant: TenantItem): Promise<void> {
    try {
      // Selecciona el tenant y establece la sesión
      this.selectedTenant = this.sessionService.getSelectedTenant(tenant.code);
      this.tenantService.setTenant(tenant.code);

      // Navega al tenant seleccionado
      await this.router.navigate([tenant.code]);

      // Activa el estado de carga
      this.loadingStateService.setLoading(true);

      // Espera a que se complete la búsqueda de sesión
      await this.sessionService.findAndSetSessionPromise();

      // Obtiene el defaultUrl usando firstValueFrom
      const defaultUrl = await firstValueFrom(this.sessionService.defaultUrl$);

      // Navega a la URL construida con el tenant y defaultUrl
      await this.router.navigateByUrl(`${tenant.code}/${defaultUrl}`);

      // Refresca la página solo si es absolutamente necesario
      window.location.reload(); // Evalúa si realmente necesitas esta línea
    } catch (error) {
      console.error('Error cambiando el tenant:', error);
    } finally {
      // Asegúrate de que el estado de carga se desactive después del cambio
      this.loadingStateService.setLoading(false);
    }
  }

  logout(): void {
    this.sessionService.clearSession();
    this.router.navigateByUrl('/auth/login');
  }

  submit(): void {
    this.showLoader = true;
    const request: UserChangePsw = {
      password: this.form.value.curretPassword,
      newPassword: this.form.value.confirmPassword,
    };

    this.authService.changePassword(request).subscribe({
      next: async () => {
        this.sessionService.sessionReady$.subscribe({
          next: () => {
            this.notificationService.showAlert(
              'Información',
              'Su contraseña a sido modificada.'
            );
          },
          error: () => {
            this.notificationService.showAlert(
              'Advertencia',
              'La contraseña actual no es correcta.'
            );
          },
        });
      },
      complete: () => {
        this.showLoader = false;
        this.changePsw = false;
        this.form.reset();
      },
      error: (error) => {
        console.error(error);
        this.notificationService.showAlert(error.error, 'Error!');
        this.showLoader = false;
      },
    });
  }
  showChangePassword(event: Event): void {
    event.stopPropagation();
    this.changePsw = true;
  }

  hideChangePassword(): void {
    this.changePsw = false;
    this.form.reset(); // If needed, otherwise remove this line if no form is involved.
    if (this.profileMenuTrigger) {
      this.profileMenuTrigger.closeMenu();
    }
  }

  // Mantener el menú abierto al hacer clic en el formulario
  onMenuOpened() {
    this.changePsw = false;
  }

  // Método que se ejecuta cuando se cierra el menú
  onMenuClosed() {
    this.changePsw = false;
  }

  handleTab(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.stopPropagation();
    }
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

@Component({
  selector: 'search-dialog',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    TablerIconsModule,
    FormsModule,
    ChangePasswordComponent,
  ],
  templateUrl: 'search-dialog.component.html',
})
export class AppSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;
  navItemsData = navItems.filter((navitem) => navitem.displayName);
}
