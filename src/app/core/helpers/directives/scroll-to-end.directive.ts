import { Directive, EventEmitter, Input, Output, OnDestroy, AfterViewInit } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';

export interface IAutoCompleteScrollEvent {
    autoComplete: MatAutocomplete;
    scrollEvent: Event;
}

@Directive({
    selector: 'mat-autocomplete[optionsScroll]',
    standalone: true
})
export class OptionsScrollDirective implements AfterViewInit, OnDestroy {
    @Output('optionsScroll') scroll = new EventEmitter<IAutoCompleteScrollEvent>();
    private _onDestroy = new Subject<void>();

    constructor(private autoComplete: MatAutocomplete) { }

    ngAfterViewInit() {
        this.autoComplete.opened.pipe(
            tap(() => {
                setTimeout(() => {
                    this.removeScrollEventListener();
                    if (this.autoComplete.panel && this.autoComplete.panel.nativeElement) {
                        this.autoComplete.panel.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
                    }
                });
            }),
            takeUntil(this._onDestroy)
        ).subscribe();

        this.autoComplete.closed.pipe(
            tap(() => this.removeScrollEventListener()),
            takeUntil(this._onDestroy)
        ).subscribe();
    }

    private removeScrollEventListener() {
        if (this.autoComplete.panel && this.autoComplete.panel.nativeElement) {
            this.autoComplete.panel.nativeElement.removeEventListener('scroll', this.onScroll);
        }
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
        this.removeScrollEventListener();
    }

    onScroll(event: Event) {
        const target = event.target as HTMLInputElement;
        const threshold = target.scrollHeight;
        const current = target.scrollTop + target.clientHeight;

        if (current >= threshold) {
            this.scroll.next({ autoComplete: this.autoComplete, scrollEvent: event });
        }
    }
}
