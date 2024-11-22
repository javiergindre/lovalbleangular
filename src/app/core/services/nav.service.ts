import { Injectable } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TenantService } from './tenant.service';
import { SessionService } from './session.service';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavService {
  public currentUrl = new BehaviorSubject<any>(undefined);

  constructor(
    private router: Router,
    private tenantService: TenantService,
    private sessionService: SessionService
  ) {
    // Observar eventos de navegación
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.next(event.urlAfterRedirects);
      }
    });

    // Interceptar navegaciones
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart
        )
      )
      .subscribe((event: NavigationStart) => {
        const url = event.url;
        if (url === '/' || url === '/redirect') {
          this.handleRootNavigation();
        } else {
          const tenant = this.tenantService.getTenant();
          const modifiedUrl = this.modifyUrl(url, tenant);
          if (url !== modifiedUrl) {
            this.router.navigateByUrl(modifiedUrl, { replaceUrl: true });
          }
        }
      });
  }

  private handleRootNavigation() {
    const tenant = this.tenantService.getTenant();
    if (this.sessionService.isLoggedIn()) {
      this.sessionService.defaultUrl$.subscribe((defaultUrl) => {
        this.router.navigateByUrl(`${tenant}/${defaultUrl}`, {
          replaceUrl: true,
        });
      });
    } else {
      this.router.navigateByUrl(this.tenantService.getDefaultLoginRoute(), {
        replaceUrl: true,
      });
    }
  }

  private modifyUrl(url: string, tenant: string): string {
    if (!url.startsWith(`/${tenant}`)) {
      return `/${tenant}${url}`;
    }
    return url;
  }
}
