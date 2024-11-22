import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const pathGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const url = state.url;
  const tenantSegment = extractTenantSegment(url);

  function extractTenantSegment(url: string): string {
    const segments = url.split('/');
    return segments[1] ?? ''; // Suponiendo que el tenant siempre está en la primera posición.
  }

  function removeTenantSegment(url: string, tenant: string): string {
    return url.replace(`/${tenant}/`, '') || '/';
  }

  function hasAccess(url: string, menuItems: any[]): boolean {
    for (const item of menuItems) {
      if (item.to === url) {
        return true;
      }

      if (item.children) {
        const hasChildAccess = hasAccess(url, item.children);
        if (hasChildAccess) {
          return true;
        }
      }
    }
    return false;
  }

  return sessionService.getSessionMenu().pipe(
    map((menuItems) => {
      const sanitizedUrl = removeTenantSegment(url, tenantSegment);
      const access = hasAccess(sanitizedUrl, menuItems);

      if (!access) {
        router.navigate(['']);
      }

      return access;
    })
  );
};
