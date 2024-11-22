// tenant.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  environment,
  Tenant,
  TenantSettings,
} from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private tenant: string;

  constructor() {
    this.setTenantOnLoad();
  }

  getDefaultHomeRoute(tenant: string = environment.defaultTenant): string {
    return `/${this.tenant}/home`;
  }

  getDefaultLoginRoute(tenant: string = environment.defaultTenant): string {
    return `/${this.tenant}/auth/login`;
  }

  isValidTenant(tenant: string): boolean {
    return environment.tenants.some((x) => x.code === tenant);
  }

  private setTenantOnLoad() {
    // si  la instancia no tiene multitenant, se elige siempre el tenant default. esto es a nivel enviroment.
    // en caso de que sea multitenant, vamos a splitear y buscar el tenant, EN EL LISTADO DE TENANTS QUE TIENE LA APP.
    if (environment.allowMultitenant) {
      // debugger
      const pathSegments = window.location.pathname
        .split('/')
        .filter((segment) => segment);
      const selectedTenant = pathSegments.length > 0 ? pathSegments[0] : '';
      this.tenant = environment.tenants.some((x) => x.code === selectedTenant)
        ? selectedTenant
        : environment.defaultTenant;
    } else {
      this.tenant = environment.defaultTenant;
    }

    // const hostname = window.location.hostname;
    // if (hostname.includes('localhost')) {
    //   // For local development, use the first path segment as the tenant
    //   const pathSegments = window.location.pathname.split('/');
    //   this.tenant = pathSegments.length > 1 ? pathSegments[1] : '';
    // } else {
    //   // For production, use the subdomain
    //   const subdomain = hostname.split('.')[0];
    //   this.tenant = subdomain;
    // }
  }

  getTenant(): string {
    return this.tenant;
  }

  setTenant(tenant: string): void {
    this.tenant = tenant;
  }

  getTenantSettings(): Tenant {
    return environment.tenants.find((x) => x.code == this.tenant)!;
  }
}
