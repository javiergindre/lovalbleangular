import { Component, OnInit, OnDestroy, Input, Optional, Self, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NgControl, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { debounceTime, switchMap, scan, takeWhile, finalize, startWith, distinctUntilChanged, tap, filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { OptionsScrollDirective } from 'src/app/core/helpers/directives/scroll-to-end.directive';
import { MaterialModule } from 'src/app/material.module';
import { FocusMonitor } from '@angular/cdk/a11y';
import { LookupModel } from 'src/app/core/models/lookup/lookup-model';


/*
      <div class="row mt-3">
        <div class="col-6">
          <mat-label class="mat-subtitle-2 f-w-600 d-block m-b-16"
            >Cobertura</mat-label
          >
          <mat-form-field appearance="outline" class="w-100">
            <app-infinite-autocomplete
              formControlName="taxCondition"
              [fetchFn]="fetchPlans"
              [pageSize]="10"
              [filter]="'1'"
              [debounceTime]="200"
              placeholder="Seleccione una cobertura"
            ></app-infinite-autocomplete>
          </mat-form-field>
        </div>
      </div>
*/
interface AccumulatorType {
  page: number;
  items: any[];
}

@Component({
  selector: 'app-infinite-autocomplete',
  standalone: true,
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule, OptionsScrollDirective],
  template: `
    <input type="text" matInput [formControl]="inputControl" [matAutocomplete]="auto" [placeholder]="placeholder" (blur)="onBlur()">
    <mat-autocomplete 
      #auto="matAutocomplete" 
      [displayWith]="displayFn"
      (optionSelected)="onOptionSelected($event.option.value)"
      appScrollToEnd 
      (optionsScroll)="onScrollToEnd()">
      @for (option of filteredOptions$ | async; track option.id) {
        <mat-option [value]="option">
          {{ option.text }}
        </mat-option>
      }
      @if(isLoading$ | async) {
        <div class="d-flex justify-content-center">
          <mat-progress-bar mode="indeterminate" diameter="20" style="width: 95%;"></mat-progress-bar>
        </div>
      }
    </mat-autocomplete>
  `,
  providers: [
    { provide: MatFormFieldControl, useExisting: InfiniteAutocompleteComponent }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfiniteAutocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor, MatFormFieldControl<LookupModel> {
  @Input() pageSize = 10;
  @Input() debounceTime = 200;
  @Input() placeholder = '';
  @Input() filter = '';
  @Input() fetchFn!: (page: number, pageSize: number, query: string, filter: string) => Observable<LookupModel[]>;
  @Input() useTextAsValue = false; // Nueva propiedad para controlar si se usa text como valor
  options: LookupModel[] = [];

  onBlur() {
    const value = this.inputControl.value;
    if (!this.validateSelection(value ?? '')) {
      // Si el valor no es válido, puedes mostrar un mensaje de error o resetear el valor del inputControl
      console.error('Opción no válida');
      this.inputControl.setValue(''); // O resetear el valor a null
      this.inputControl.markAsTouched();
      this.inputControl.markAsDirty();
    }
  }

  static nextId = 0;
  focused = false;
  touched = false;
  controlType = 'app-infinite-autocomplete';
  id = `infinite-autocomplete-${InfiniteAutocompleteComponent.nextId++}`;
  onChange = (_: any) => { };
  onTouched = () => { };

  inputControl = new FormControl('');
  filteredOptions$: Observable<LookupModel[]>;
  isLoading$ = new BehaviorSubject<boolean>(false);

  private nextPage$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private fm: FocusMonitor,
    private elRef: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    fm.monitor(elRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
      this.cdr.markForCheck();
    });
  }

  get empty() {
    return !this.inputControl.value;
  }

  get shouldLabelFloat() { return this.focused || !this.empty; }

  @Input()
  get value(): any { return this.inputControl.value; }
  set value(value: any) {
    this.inputControl.setValue(value);
    this.stateChanges.next();
    this.cdr.markForCheck();
  }

  @Input()
  get required(): boolean { return this._required; }
  set required(req: boolean) {
    this._required = req;
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = value;
    this._disabled ? this.inputControl.disable() : this.inputControl.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get errorState(): boolean {
    return this.inputControl.invalid && this.touched;
  }

  stateChanges = new Subject<void>();
  private skipNextValueChange = false;

  ngOnInit() {
    if (!this.fetchFn) {
      console.error('fetchFn is required for InfiniteAutocompleteComponent');
      return;
    }

    const filter$ = this.inputControl.valueChanges.pipe(
      startWith(''),
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      filter(value => typeof value === 'string')
    );

    this.filteredOptions$ = filter$.pipe(
      switchMap(filter => {
        const initial$ = of(null);
        const scroll$ = this.nextPage$;

        return merge(initial$, scroll$).pipe(
          scan<any, AccumulatorType>((acc) => ({ page: acc.page + 1, items: acc.items }), { page: 0, items: [] }),
          switchMap(({ page }) => {
            this.isLoading$.next(true);
            return this.fetchFn(page, this.pageSize, typeof filter === 'string' ? filter : '', this.filter).pipe(
              finalize(() => this.isLoading$.next(false))
            );
          }),
          takeWhile(newItems => newItems.length > 0, true),
          scan<LookupModel[], LookupModel[]>((acc, newItems) => [...acc, ...newItems], []),
          tap(() => this.cdr.markForCheck()),
          tap((options) => {
            this.options = options;
          }),
        );
      })
    );
  }

  validateSelection(value: string | LookupModel): boolean {
    if (typeof value === 'string') {
      return this.options.some((option) => option.text === value);
    } else {
      return this.options.some((option) => option.id === value.id);
    }
  }

  onScrollToEnd() {
    this.nextPage$.next();
  }

  trackById(index: number, item: LookupModel) {
    return item.id;
  }

  displayFn = (option: LookupModel): string => {
    return option && option.text ? option.text : '';
  };

  writeValue(value: string | LookupModel): void {
    if (typeof value === 'string') {
      // Aquí podrías buscar el objeto completo si lo necesitas
      this.value = { id: value, text: value };
    } else {
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onOptionSelected(value: LookupModel) {


    if (this.validateSelection(value)) {
      this.onChange(this.useTextAsValue ? value.text : value.id);
      this.onTouched();
    } else {
      console.error('Opción no válida');
    }
  }

  setDescribedByIds(ids: string[]): void {
    // Implementación opcional
  }

  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() != 'input') {
      this.elRef.nativeElement.querySelector('input')!.focus();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }
}

// import { Component, OnInit, OnDestroy, Input, Optional, Self, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
// import { ControlValueAccessor, NgControl, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MatFormFieldControl } from '@angular/material/form-field';
// import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
// import { debounceTime, switchMap, scan, takeWhile, finalize, startWith, distinctUntilChanged, tap, filter } from 'rxjs/operators';
// import { CommonModule } from '@angular/common';
// import { OptionsScrollDirective } from 'src/app/core/helpers/directives/scroll-to-end.directive';
// import { MaterialModule } from 'src/app/material.module';
// import { FocusMonitor } from '@angular/cdk/a11y';
// import { LookupModel } from 'src/app/core/models/lookup/lookup-model';

// interface AccumulatorType {
//   page: number;
//   items: any[];
// }

// @Component({
//   selector: 'app-infinite-autocomplete',
//   standalone: true,
//   imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule, OptionsScrollDirective],
//   template: `
//     <input type="text" matInput [formControl]="inputControl" [matAutocomplete]="auto" [placeholder]="placeholder" />
//     <mat-autocomplete
//       #auto="matAutocomplete"
//       [displayWith]="displayFn"
//       (optionSelected)="onOptionSelected($event.option.value)"
//       appScrollToEnd
//       (optionsScroll)="onScrollToEnd()">
//       @for (option of filteredOptions$ | async; track option.id) {
//         <mat-option [value]="option">
//           {{ option.text }}
//         </mat-option>
//       }
//       @if(isLoading$ | async) {
//         <div class="d-flex justify-content-center">
//           <mat-progress-bar mode="indeterminate" diameter="20" style="width: 95%;"></mat-progress-bar>
//         </div>
//       }
//     </mat-autocomplete>
//   `,
//   providers: [
//     { provide: MatFormFieldControl, useExisting: InfiniteAutocompleteComponent }
//   ],
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class InfiniteAutocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor, MatFormFieldControl<LookupModel> {
//   @Input() pageSize = 10;
//   @Input() debounceTime = 200;
//   @Input() placeholder = '';
//   @Input() filter = '';
//   @Input() fetchFn!: (page: number, pageSize: number, query: string, filter: string) => Observable<LookupModel[]>;
//   @Input() useTextAsValue = false; // Nueva propiedad para controlar si se usa text como valor

//   static nextId = 0;
//   focused = false;
//   touched = false;
//   controlType = 'app-infinite-autocomplete';
//   id = `infinite-autocomplete-${InfiniteAutocompleteComponent.nextId++}`;
//   onChange = (_: any) => { };
//   onTouched = () => { };

//   inputControl = new FormControl('');
//   filteredOptions$: Observable<LookupModel[]>;
//   isLoading$ = new BehaviorSubject<boolean>(false);

//   private nextPage$ = new Subject<void>();
//   private destroy$ = new Subject<void>();

//   constructor(
//     @Optional() @Self() public ngControl: NgControl,
//     private fm: FocusMonitor,
//     private elRef: ElementRef<HTMLElement>,
//     private cdr: ChangeDetectorRef
//   ) {
//     if (this.ngControl != null) {
//       this.ngControl.valueAccessor = this;
//     }
//     fm.monitor(elRef.nativeElement, true).subscribe(origin => {
//       this.focused = !!origin;
//       this.stateChanges.next();
//       this.cdr.markForCheck();
//     });
//   }

//   get empty() {
//     return !this.inputControl.value;
//   }

//   get shouldLabelFloat() { return this.focused || !this.empty; }

//   @Input()
//   get value(): any { return this.inputControl.value; }
//   set value(value: any) {
//     this.inputControl.setValue(value);
//     this.stateChanges.next();
//     this.cdr.markForCheck();
//   }

//   @Input()
//   get required(): boolean { return this._required; }
//   set required(req: boolean) {
//     this._required = req;
//     this.stateChanges.next();
//   }
//   private _required = false;

//   @Input()
//   get disabled(): boolean { return this._disabled; }
//   set disabled(value: boolean) {
//     this._disabled = value;
//     this._disabled ? this.inputControl.disable() : this.inputControl.enable();
//     this.stateChanges.next();
//   }
//   private _disabled = false;

//   @Input()
//   get errorState(): boolean {
//     return this.inputControl.invalid && this.touched;
//   }

//   stateChanges = new Subject<void>();
//   private skipNextValueChange = false;

//   ngOnInit() {
//     if (!this.fetchFn) {
//       console.error('fetchFn is required for InfiniteAutocompleteComponent');
//       return;
//     }

//     const filter$ = this.inputControl.valueChanges.pipe(
//       startWith(''),
//       debounceTime(this.debounceTime),
//       distinctUntilChanged(),
//       filter(value => typeof value === 'string')
//     );

//     this.filteredOptions$ = filter$.pipe(

//       switchMap(filter => {
//         const initial$ = of(null);
//         const scroll$ = this.nextPage$;

//         return merge(initial$, scroll$).pipe(
//           scan<any, AccumulatorType>((acc) => ({ page: acc.page + 1, items: acc.items }), { page: 0, items: [] }),
//           switchMap(({ page }) => {
//             this.isLoading$.next(true);
//             return this.fetchFn(page, this.pageSize, typeof filter === 'string' ? filter : '', this.filter).pipe(
//               finalize(() => this.isLoading$.next(false))
//             );
//           }),
//           takeWhile(newItems => newItems.length > 0, true),
//           scan<LookupModel[], LookupModel[]>((acc, newItems) => [...acc, ...newItems], []),
//           tap(() => this.cdr.markForCheck())
//         );
//       })
//     );
//   }

//   onScrollToEnd() {
//     this.nextPage$.next();
//   }

//   trackById(index: number, item: LookupModel) {
//     return item.id;
//   }

//   displayFn = (option: LookupModel): string => {
//     return option && option.text ? option.text : '';
//   };

//   writeValue(value: string | LookupModel): void {
//     if (typeof value === 'string') {
//       // Aquí podrías buscar el objeto completo si lo necesitas
//       this.value = { id: value, text: value };
//     } else {
//       this.value = value;
//     }
//   }

//   registerOnChange(fn: any): void {
//     this.onChange = fn;
//   }

//   registerOnTouched(fn: any): void {
//     this.onTouched = fn;
//   }

//   setDisabledState(isDisabled: boolean): void {
//     this.disabled = isDisabled;
//   }

//   onOptionSelected(value: LookupModel) {
//     this.onChange(this.useTextAsValue ? value.text : value.id);
//     this.onTouched();
//   }

//   setDescribedByIds(ids: string[]): void {
//     // Implementación opcional
//   }

//   onContainerClick(event: MouseEvent): void {
//     if ((event.target as Element).tagName.toLowerCase() != 'input') {
//       this.elRef.nativeElement.querySelector('input')!.focus();
//     }
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//     this.stateChanges.complete();
//     this.fm.stopMonitoring(this.elRef.nativeElement);
//   }
// }