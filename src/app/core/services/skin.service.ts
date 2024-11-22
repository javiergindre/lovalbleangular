import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SkinService {
    private skinDevSubject = new BehaviorSubject<boolean>(false);
    public skinDev$ = this.skinDevSubject.asObservable();

    constructor() {
        this.initializeSkinDev();
    }

    private initializeSkinDev(): void {
        const currentTenant = environment.tenants.find(tenant => tenant.code === environment.defaultTenant);
        if (currentTenant) {
        this.skinDevSubject.next(currentTenant.settings.skinDev);
    }
}}
