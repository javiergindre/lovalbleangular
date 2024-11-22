import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const session = sessionService.getSessionToken();
  if (session) {
    return true;
  } else {
    router.navigate(['auth/login']);
    // router.navigate(['auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
