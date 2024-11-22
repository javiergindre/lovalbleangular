import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { Token } from '../models/auth/session';
import {
  MenuItemDto,
  Session,
  TenantItem,
  TenantSession,
} from '../models/menu/session';
import { environment } from 'src/environments/environment';
import {
  BehaviorSubject,
  firstValueFrom,
  Observable,
  of,
  throwError,
} from 'rxjs';
import { TenantService } from './tenant.service';
import { Router } from '@angular/router';
import { endpoints } from '../helpers/endpoints';
import { Workflow } from '../models/workflows/workflow';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private tenantService = inject(TenantService);
  private router = inject(Router);

  private personNameSubject: BehaviorSubject<string>;
  personName$: Observable<string>;

  private workFlowsSubject: BehaviorSubject<Workflow[]>;
  workFlows$: Observable<Workflow[]>;

  private userNameSubject: BehaviorSubject<string>;
  userName$: Observable<string>;

  private isProviderSubject: BehaviorSubject<boolean>;
  isProvider$: Observable<boolean>;

  private isSalesManagerSubject: BehaviorSubject<boolean>;
  isSalesManager$: Observable<boolean>;

  private isHealthSupervisorSubject: BehaviorSubject<boolean>;
  isHealthSupervisor$: Observable<boolean>;

  private defaultUrlSubject: BehaviorSubject<string>;
  defaultUrl$: Observable<string>;

  constructor() {
    const personName = localStorage.getItem('personName') || '';
    this.personNameSubject = new BehaviorSubject<string>(personName);
    this.personName$ = this.personNameSubject.asObservable();

    const userName = localStorage.getItem('userName') || '';
    this.userNameSubject = new BehaviorSubject<string>(userName);
    this.userName$ = this.userNameSubject.asObservable();

    const isProvider = localStorage.getItem('isProvider') === 'true';
    this.isProviderSubject = new BehaviorSubject<boolean>(isProvider);
    this.isProvider$ = this.isProviderSubject.asObservable();

    const isSalesManager = localStorage.getItem('isSalesManager') === 'true';
    this.isSalesManagerSubject = new BehaviorSubject<boolean>(isSalesManager);
    this.isSalesManager$ = this.isSalesManagerSubject.asObservable();

    const isHealthSupervisor = localStorage.getItem('isHealthSupervisor') === 'true';
    this.isHealthSupervisorSubject = new BehaviorSubject<boolean>(isHealthSupervisor);
    this.isHealthSupervisor$ = this.isHealthSupervisorSubject.asObservable();

    const defaultUrl = localStorage.getItem('defaultUrl') || '';
    this.defaultUrlSubject = new BehaviorSubject<string>(defaultUrl);
    this.defaultUrl$ = this.defaultUrlSubject.asObservable();

    const workflows: Workflow[] = localStorage.getItem('workflows') ? JSON.parse(localStorage.getItem('workflows')!) : [];
    this.workFlowsSubject = new BehaviorSubject<Workflow[]>(workflows);
    this.workFlows$ = this.workFlowsSubject.asObservable();


  }

  setToken(token: Token): void {
    localStorage.setItem('token', token.token);
    localStorage.setItem('expiration', token.expiration);
  }

  getSessionToken(): string | null {
    return localStorage.getItem('token');
  }

  clearSession(path: string = '/auth/login'): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('tenantSession');
    localStorage.removeItem('userName');
    localStorage.removeItem('personName');
    localStorage.removeItem('menu');
    localStorage.removeItem('tenants');
    localStorage.removeItem('isProvider');
    localStorage.removeItem('isSalesManager');
    localStorage.removeItem('isHealthSupervisor');
    localStorage.removeItem('defaultUrl');
    localStorage.removeItem('idUser');
    localStorage.removeItem('workflows');

    this.personNameSubject.next('');
    this.userNameSubject.next('');
    this.isProviderSubject.next(false);
    this.isSalesManagerSubject.next(false);
    this.isHealthSupervisorSubject.next(false);
    this.defaultUrlSubject.next('');
    this.workFlowsSubject.next([]);


    this.router
      .navigateByUrl(this.tenantService.getTenant() + path)
      .then(() => {
        // window.location.reload();
      });
  }

  setSession(session: Session): void {

    localStorage.setItem('tenants', JSON.stringify(session.tenants));
    localStorage.setItem('personName', session.personName);
    localStorage.setItem('userName', session.userName);
    localStorage.setItem('isProvider', session.isProvider.toString());
    localStorage.setItem('idUser', session.id.toString());
    localStorage.setItem('isSalesManager', session.isSalesManager.toString());
    localStorage.setItem('isHealthSupervisor', session.isHealthSupervisor.toString());
    localStorage.setItem('defaultUrl', session.defaultUrl);
    localStorage.setItem('defaultUrl', session.defaultUrl);
    localStorage.setItem('workflows', JSON.stringify(session.workflows));

    this.personNameSubject.next(session.personName);
    this.userNameSubject.next(session.userName);
    this.isProviderSubject.next(session.isProvider);
    this.isSalesManagerSubject.next(session.isSalesManager);
    this.isHealthSupervisorSubject.next(session.isHealthSupervisor);
    this.userNameSubject.next(session.userName);
    this.defaultUrlSubject.next(session.defaultUrl);
    this.workFlowsSubject.next(session.workflows);

    const tenantSession: TenantSession[] = [
      {
        menu: session.menu,
        tenantName: session.tenantName,
        tenantCode: session.tenantCode,
        onLogin: session.onLogin,
        onLogout: session.onLogout,
        onLogoutType: session.onLogoutType,
      },
    ];
    localStorage.setItem('tenantSession', JSON.stringify(tenantSession));
  }

  getAndSetSessionMenu(): Observable<MenuItemDto[]> {

    return this.http.get<Session>(`${this.baseUrl}${endpoints.SESSION}`).pipe(
      tap((result) => { console.log(result); this.setSession(result) }),
      map((result) => result.menu)
    );
  }

  getSessionMenu(): Observable<MenuItemDto[]> {
    const tenantSessionString = localStorage.getItem('tenantSession');
    let menuItems: MenuItemDto[] = [];

    if (tenantSessionString) {
      try {
        const tenantSession: TenantSession[] = JSON.parse(tenantSessionString);
        const urlTenant = this.tenantService.getTenant();
        menuItems =
          tenantSession.find((menuItem) => menuItem.tenantCode === urlTenant)
            ?.menu ?? [];
      } catch (error) {
        console.error('Error parsing tenantSession from localStorage', error);
      }
      return of(menuItems);
    } else {
      return this.getAndSetSessionMenu();
    }
  }

  getTenants(): Observable<TenantItem[]> {
    return of(null).pipe(
      map(() => {
        const tenants = localStorage.getItem('tenants');
        if (tenants) {
          return JSON.parse(tenants) as TenantItem[];
        }
        throw new Error('No tenants found in localStorage');
      }),
      catchError((error) => {
        console.error('Error getting tenants:', error);
        return throwError(
          () => new Error(`Error getting tenants: ${error.message}`)
        );
      })
    );
  }

  getSelectedTenant(param: string | null = null): Observable<TenantItem> {
    return of(null).pipe(
      map(() => {
        const tenants = localStorage.getItem('tenants');
        if (!tenants) throw new Error('No tenants found in localStorage');

        const parsedTenants = JSON.parse(tenants) as TenantItem[];
        if (param === null) {
          if (parsedTenants.length > 0) {
            const urlTenant = this.tenantService.getTenant();
            const selectedTenant = parsedTenants.find(
              (tenant) => tenant.name === urlTenant || tenant.code === urlTenant
            );
            if (selectedTenant) return selectedTenant;
            else return parsedTenants[0];
          } else {
            throw new Error('No tenants found in the array');
          }
        }

        const selectedTenant = parsedTenants.find(
          (tenant) => tenant.name === param || tenant.code === param
        );
        if (selectedTenant) {
          return selectedTenant;
        }
        throw new Error(`Tenant with id/code ${param} not found`);
      }),
      catchError((error) => {
        console.error('Error getting selected tenant:', error);
        return throwError(
          () => new Error(`Failed to get tenant: ${error.message}`)
        );
      })
    );
  }

  private sessionReadySubject = new BehaviorSubject<boolean>(false);
  sessionReady$ = this.sessionReadySubject.asObservable();

  setSessionPromise(session: Session): Promise<void> {


    return new Promise((resolve) => {
      const lsTenants = localStorage.getItem('tenants');
      if (!lsTenants)
        localStorage.setItem('tenants', JSON.stringify(session.tenants));

      const lsPersonName = localStorage.getItem('personName');
      if (!lsPersonName) {
        localStorage.setItem('personName', session.personName);
      }

      if (!this.personNameSubject.value) {
        this.personNameSubject.next(session.personName);
      }

      const lsUserName = localStorage.getItem('userName');
      if (!lsUserName) {
        localStorage.setItem('userName', session.userName);
      }

      if (!this.userNameSubject.value) {
        this.userNameSubject.next(session.userName);
      }

      const lsIsProvider = localStorage.getItem('isProvider');
      if (!lsIsProvider) {
        localStorage.setItem('isProvider', session.isProvider.toString());
      }
      const workFlows = localStorage.getItem('workflows');
      if (!workFlows) {
        localStorage.setItem('workflows', JSON.stringify(session.workflows));
        this.workFlowsSubject.next(session.workflows);
      }

      if (!this.isProviderSubject.value) {
        this.isProviderSubject.next(session.isProvider);
      }

      const lsIsSalesManager = localStorage.getItem('isSalesManager');
      if (!lsIsSalesManager) {
        localStorage.setItem(
          'isSalesManager',
          session.isSalesManager.toString()
        );
      }

      const idUser = localStorage.getItem('idUser');
      if (!idUser) {
        localStorage.setItem('idUser', session.id.toString());
      }
      if (!this.isSalesManagerSubject.value) {
        this.isSalesManagerSubject.next(session.isSalesManager);
      }

      const isHealthSupervisor = localStorage.getItem('isHealthSupervisor');
      if (!isHealthSupervisor) {
        localStorage.setItem('isHealthSupervisor', session.isHealthSupervisor.toString());
      }



      if (!this.isHealthSupervisorSubject.value) {
        this.isHealthSupervisorSubject.next(session.isHealthSupervisor);
      }


      localStorage.setItem('defaultUrl', session.defaultUrl);
      this.defaultUrlSubject.next(session.defaultUrl);
      const tenantSession: TenantSession[] = [
        {
          menu: session.menu,
          tenantName: session.tenantName,
          tenantCode: session.tenantCode,
          onLogin: session.onLogin,
          onLogout: session.onLogout,
          onLogoutType: session.onLogoutType,
        },
      ];

      const existingTenantSessionString = localStorage.getItem('tenantSession');
      if (existingTenantSessionString) {
        let existingTenantSession: TenantSession[] = JSON.parse(
          existingTenantSessionString
        );
        if (
          existingTenantSession.length > 0 &&
          !existingTenantSession.some(
            (item) => item.tenantCode === session.tenantCode
          )
        ) {
          existingTenantSession = [...tenantSession, ...existingTenantSession];
        }
        localStorage.setItem(
          'tenantSession',
          JSON.stringify(existingTenantSession)
        );
      } else {
        localStorage.setItem('tenantSession', JSON.stringify(tenantSession));
      }
      this.sessionReadySubject.next(true);
      resolve();
    });
  }

  async findAndSetSessionPromise(): Promise<void> {
    try {
      const session = await firstValueFrom(
        this.http.get<Session>(`${this.baseUrl}${endpoints.SESSION}`)
      );
      if (session) {
        await this.setSessionPromise(session);
      } else {
        console.error('Session is undefined');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  }
}
