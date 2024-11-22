import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TenantService } from '../services/tenant.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const route = inject(ActivatedRoute);
  const tenantService = inject(TenantService);
  const tenant = tenantService.getTenant();
  
  req = req.clone({
    setHeaders: {
      'X-Tenant-Code': tenant,
    },
  });

  return next(req);
};
