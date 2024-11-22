import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreService } from 'src/app/core/services/core.service';
import { TenantService } from 'src/app/core/services/tenant.service';
import { Tenant } from 'src/environments/environment';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [NgIf, RouterModule],
  template: `
    <div class="branding">
      @if(options.theme === 'light') {
        <!-- src="./assets/images/logos/dark-logo.svg" -->
      <a [routerLink]="['']">
        <img
          [src]="tenantSettings.settings.logo"
          style="max-width: 200px; max-height: 45px;"
          class="align-middle m-2"
          alt="logo"
        />
      </a>
      } @if(options.theme === 'dark') {
      <a [routerLink]="['']">
        <img
          src="./assets/images/logos/light-logo.svg"
          class="align-middle m-2"
          alt="logo"
        />
      </a>
      }
    </div>
  `,
})
export class BrandingComponent {
  options = this.settings.getOptions();
  tenantService = inject(TenantService);
  tenantSettings: Tenant = this.tenantService.getTenantSettings();

  constructor(private settings: CoreService) { }
}
