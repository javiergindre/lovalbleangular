import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from '../services/session.service';
import { TenantService } from '../services/tenant.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const tenantService = inject(TenantService);
  const router = inject(Router);

  const token = sessionService.getSessionToken(); // Asumiendo que tienes un método getToken() en AuthService

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const ignoreAPIs = ['/authentication/'];
      if (ignoreAPIs.some((api) => req.url.includes(api))) {
        return throwError(() => error);
      }
      console.log("error");
      
      switch (error.status) {
        case 401:
          return handle401(sessionService);
        case 403:
          return handle403(sessionService, tenantService, router);
        default:
          return throwError(() => error);
      }
    })
  );
};

function handle401(sessionService: SessionService) {
  sessionService.clearSession("/auth/unauthorized");
  return throwError(() => new Error('No autorizado'));
}

function handle403(sessionService: SessionService, tenantService: TenantService, router: Router) {
  router.navigate(['']);

  return throwError(() => new Error('Contenido no permitido'));
}