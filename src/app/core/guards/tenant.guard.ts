// tenant.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { TenantService } from '../services/tenant.service';
import { firstValueFrom } from 'rxjs';

export const tenantGuard: CanActivateFn = async (route, state) => {
  const sessionService = inject(SessionService);
  const tenantService = inject(TenantService);
  const router = inject(Router);

  const pathSegments = state.url.split('/').filter((segment) => segment);
  const selectedTenant = pathSegments.length > 0 ? pathSegments[0] : '';

  if (!selectedTenant || selectedTenant === 'redirect') {
    if (sessionService.isLoggedIn()) {
      const defaultUrl = await firstValueFrom(sessionService.defaultUrl$);
      const tenant = tenantService.getTenant();
      router.navigate([`${tenant}/${defaultUrl}`]);
      // router.navigate([tenantService.getDefaultHomeRoute()]);
    } else {
      router.navigate([tenantService.getDefaultLoginRoute()]);
    }
    return false;
  }

  if (!tenantService.isValidTenant(selectedTenant)) {
    router.navigate([tenantService.getDefaultHomeRoute()]);
    return false;
  }

  tenantService.setTenant(selectedTenant);

  return true;
};
