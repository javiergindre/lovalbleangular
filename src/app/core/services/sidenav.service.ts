import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  private sidenavCollapsedSubject = new BehaviorSubject<boolean>(false);
  sidenavCollapsed$ = this.sidenavCollapsedSubject.asObservable();

  toggleSidenav(collapsed: boolean) {
    this.sidenavCollapsedSubject.next(collapsed);
  }
}
