import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { CoreService } from 'src/app/core/services/core.service';
import { AppSettings } from 'src/app/config';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { NavService } from '../../core/services/nav.service';
import { AppNavItemComponent } from './vertical/sidebar/nav-item/nav-item.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './vertical/sidebar/sidebar.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HeaderComponent } from './vertical/header/header.component';
import { AppBreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';
import { CustomizerComponent } from './shared/customizer/customizer.component';
import {
  MenuItemDto,
  MenuSearchResult,
} from 'src/app/core/models/menu/session';
import { NavItem } from './vertical/sidebar/nav-item/nav-item';
import { transformMenu } from 'src/app/core/helpers/transform-menu';
import { SessionService } from 'src/app/core/services/session.service';
import { ArventAiComponent } from "./shared/arvent-ai/customizer.component";
import { TenantService } from 'src/app/core/services/tenant.service';
import { Tenant } from 'src/environments/environment';
import { SkinService } from 'src/app/core/services/skin.service';
import { LoadingStateService } from 'src/app/core/services/loading-state.service';
import { SidenavService } from 'src/app/core/services/sidenav.service';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [
    RouterModule,
    AppNavItemComponent,
    MaterialModule,
    CommonModule,
    SidebarComponent,
    NgScrollbarModule,
    TablerIconsModule,
    HeaderComponent,
    AppBreadcrumbComponent,
    CustomizerComponent,
    ArventAiComponent
  ],
  templateUrl: './full.component.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None,
})
export class FullComponent implements OnInit {
  @ViewChild('leftsidenav')
  public sidenav: MatSidenav;
  resView = false;
  @ViewChild('content', { static: true }) content!: MatSidenavContent;
  //get options from service
  options = this.settings.getOptions();
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;

  sessionService = inject(SessionService);
  tenantService = inject(TenantService);
  loadingStateService = inject(LoadingStateService);
  private skinService = inject(SkinService);
  private sidenavService = inject(SidenavService);
  menuItems: MenuItemDto[] = [];
  navItems: NavItem[] = [];
  tenatSettings: Tenant = this.tenantService.getTenantSettings();
  personName: Observable<string>;
  userName: Observable<string>;
  showInitials = false;
  initials: string;
  public skinDev: boolean = false;
  // userName: Observable<string>;

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  get isTablet(): boolean {
    return this.resView;
  }

  constructor(
    private settings: CoreService,
    private mediaMatcher: MediaMatcher,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private navService: NavService
  ) {
    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW, BELOWMONITOR])
      .subscribe((state) => {
        // SidenavOpened must be reset true when layout changes
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[BELOWMONITOR];
        // this.isMobileScreen = state.breakpoints[MOBILE_VIEW]; venía por defecto así y funcionaba mal
        if (this.options.sidenavCollapsed == false) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
        this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
        this.resView = state.breakpoints[BELOWMONITOR];
      });

    // Initialize project theme with options
    this.receiveOptions(this.options);

    // This is for scroll to top
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((e) => {
        this.content.scrollTo({ top: 0 });
      });

    // Initialize Skin Service
    this.skinService.skinDev$.subscribe(skinDev => {
      this.skinDev = skinDev;
    });
  }

  changeSideMenu(navItems: MenuItemDto) {
    if (navItems.children)
      this.navItems = [
        { navCap: navItems.title },
        ...transformMenu(navItems.children),
      ];
    else this.navItems = [];
  }

  findMenuSubtree(
    menu: MenuItemDto[],
    url: string,
    path: MenuItemDto[] = []
  ): MenuSearchResult | null {
    for (const item of menu) {
      const currentPath = [...path, item];
      if (item.to === url) {
        return { item, path: currentPath };
      }
      if (item.children) {
        const result = this.findMenuSubtree(item.children, url, currentPath);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  initializeMenuSelection(url: string) {
    const urlSplitted = this.router.url.slice(1).split('/').slice(1);
    const path = urlSplitted.join('/');

    let result = this.findMenuSubtree(this.menuItems, path);

    if (!result) {
      result = this.findMenuSubtree(this.menuItems, "/home");
    }

    if (result) {
      const level1Item = result.path.find(item => item.level === 1);
      if (level1Item) {
        this.changeSideMenu(level1Item);
      } else {
        this.navItems = [];
      }
    } else {
      this.navItems = [];
    }
  }

  logout() {
    this.sessionService.clearSession();
    // this.router.navigateByUrl('');
  }

  ngOnInit() {
    this.sessionService.getSessionMenu().subscribe({
      next: (menuItems) => {
        this.menuItems = menuItems;
      },
      error: (err) => {
        this.menuItems = [];
        console.error(err);
      },
    });

    this.initializeMenuSelection(this.router.url);
    this.personName = this.sessionService.personName$;
    this.userName = this.sessionService.userName$;

    this.showInitials = true;
    this.personName.subscribe(res => {
      this.createInititals(res);
    });

  }

  createInititals(personName: string | null): void {
    if (!personName) {
      this.initials = '';
      return;
    }

    const parts = personName.split(/[\s,]+/).filter(part => part.length > 0);

    let initials = '';

    for (let i = 0; i < parts.length; i++) {
      if (initials.length < 2) {
        initials += parts[i].charAt(0).toUpperCase();
      }
    }

    // Si no se obtuvieron dos letras, tomar las dos primeras letras del nombre
    if (initials.length < 2) {
      const firstTwoLetters = personName.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
      initials = firstTwoLetters;
    }

    this.initials = initials;
  }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  toggleCollapsed() {
    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.sidenavService.toggleSidenav(this.options.sidenavCollapsed);
    this.resetCollapsedState();
  }

  resetCollapsedState(timer = 400) {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
    this.settings.setOptions(this.options);
  }

  receiveOptions(options: AppSettings): void {
    this.options = options;
    this.toggleDarkTheme(options);
  }

  toggleDarkTheme(options: AppSettings) {
    if (options.theme === 'dark') {
      this.htmlElement.classList.add('dark-theme');
      this.htmlElement.classList.remove('light-theme');
    } else {
      this.htmlElement.classList.remove('dark-theme');
      this.htmlElement.classList.add('light-theme');
    }
  }
}
