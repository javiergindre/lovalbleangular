import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  forwardRef,
  inject,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  ValidationErrors,
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of, combineLatest } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  map,
  tap,
  finalize,
} from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface LookupConfig {
  placeholder: string;
  url: string;
  showAddNew?: boolean;
  addNewDialogComponent?: any; // Referencia al componente para agregar una nueva entrada
  dependentField?: string; // Nombre del campo del cual depende este lookup
  dependentParamName?: string;
  errorMessage?: string; // Mensaje de error personalizable para selecciones inválidas
  valueField?: 'id' | 'text'; // Define qué valor establecer en el form control: 'id' o 'text'
  options?: any[];
  additionalParams?: { [key: string]: any }; // Nuevo campo para parámetros adicionales
}

@Component({
  selector: 'app-lookup',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div [formGroup]="formGroup">
      <mat-form-field
        appearance="outline"
        style="width: 100%"
        [ngClass]="{
          'mat-form-field-invalid':
            displayControl.invalid &&
            (displayControl.dirty || displayControl.touched)
        }"
      >
        <mat-label *ngIf="config?.placeholder">{{
          config.placeholder
        }}</mat-label>
        <input
          matInput
          [formControl]="displayControl"
          [matAutocomplete]="auto"
          (blur)="onTouched()"
          [required]="isRequired()"
        />
        <button
          mat-icon-button
          matSuffix
          *ngIf="displayControl.value && !displayControl.disabled"
          (click)="clearInput()"
        >
          <mat-icon>close</mat-icon>
        </button>
        <button
          *ngIf="config?.showAddNew"
          mat-icon-button
          matSuffix
          (click)="addNew()"
        >
          <mat-icon>add</mat-icon>
        </button>
        <mat-autocomplete
          #auto="matAutocomplete"
          (optionSelected)="onOptionSelected($event)"
        >
          <ng-container *ngIf="isLoading">
            <mat-option class="loading-option" [disabled]="true">
              <mat-progress-spinner
                diameter="24"
                mode="indeterminate"
              ></mat-progress-spinner>
              Cargando...
            </mat-option>
          </ng-container>
          <mat-option
            *ngFor="let option of filteredOptions$ | async"
            [value]="option"
          >
            {{ option.text }}
          </mat-option>
        </mat-autocomplete>
        <mat-error
          *ngIf="
            displayControl.invalid &&
            (displayControl.dirty || displayControl.touched)
          "
        >
          {{ config.errorMessage || 'Seleccione una opción válida.' }}
        </mat-error>
      </mat-form-field>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LookupComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => LookupComponent),
      multi: true,
    },
  ],
})
export class LookupComponent
  implements OnInit, ControlValueAccessor, OnChanges, Validator
{
  @Input() config: LookupConfig;
  @Input() formGroup: FormGroup;
  @Input() formControlName: string;
  @Input() defaultValue: any;
  @Output() onSelect = new EventEmitter<any>();

  control = new FormControl({ value: '', disabled: true }, Validators.required);
  displayControl = new FormControl({ value: '', disabled: true });
  filteredOptions$: Observable<any[]> = of([]);
  private availableOptions: any[] = []; // Almacena las opciones disponibles
  isLoading = false; // Variable para mostrar el spinner de carga

  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  // Métodos de ControlValueAccessor
  onChange = (_: any) => {};
  onTouched = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      if (changes['config'].currentValue?.options) {
        this.filteredOptions$ = of(changes['config'].currentValue.options);
      } else {
        // Re-inicializar las opciones cuando cambie la configuración
        this.initializeFilteredOptions();
      }
    }
  }

  ngOnInit(): void {
    if (this.config.options && this.config.options.length > 0) {
      this.availableOptions = this.config.options;
      this.filteredOptions$ = of(this.config.options);
      this.control.enable();
      this.displayControl.enable();
      this.setDefaultOption();
    } else {
      this.initializeFilteredOptions();
    }

    if (this.config?.dependentField) {
      const dependentControl = this.formGroup.get(this.config.dependentField);
      if (dependentControl) {
        dependentControl.valueChanges
          .pipe(startWith(dependentControl.value))
          .subscribe((value) => {
            if (value) {
              this.control.enable();
              this.displayControl.enable();
              this.initializeFilteredOptions();
              this.control.updateValueAndValidity();
            } else {
              this.control.disable();
              this.displayControl.disable();
              this.clearInput();
              this.control.updateValueAndValidity();
            }
          });
        // Si al iniciar hay un valor en el campo dependiente, habilitar el control
        if (dependentControl.value) {
          this.control.enable();
          this.displayControl.enable();
          this.control.updateValueAndValidity();
        } else {
          this.control.disable();
          this.displayControl.disable();
          this.control.updateValueAndValidity();
        }
      }
    } else {
      // Si no hay campo dependiente, habilitar los controles
      this.control.enable();
      this.displayControl.enable();
      this.control.updateValueAndValidity();
    }

    const controlValue = this.formGroup.get(this.formControlName)?.value;
    if (controlValue) {
      this.control.setValue(controlValue);
      this.displayControl.setValue(controlValue);
    }

    this.control.valueChanges.subscribe((value) => {
      this.onChange(value);
    });
  }

  setDefaultOption() {
    if (this.defaultValue) {
      const selectedOption = this.availableOptions?.find(
        (option) =>
          option.id === this.defaultValue ||
          (this.config.valueField === 'text' &&
            option.text === this.defaultValue)
      );
      if (selectedOption) {
        const valueToSet =
          this.config.valueField === 'text'
            ? selectedOption.text
            : selectedOption.id;
        this.control.setValue(valueToSet);
        this.displayControl.setValue(selectedOption.text, { emitEvent: false });
        this.onChange(valueToSet);
        this.onSelect.emit(selectedOption);
      }
    }
  }

  initializeFilteredOptions() {
    if (this.config?.dependentField) {
      const dependentControl = this.formGroup.get(this.config.dependentField);
      if (dependentControl) {
        this.filteredOptions$ = combineLatest([
          this.displayControl.valueChanges.pipe(
            startWith(this.displayControl.value),
            debounceTime(300),
            distinctUntilChanged()
          ),
          dependentControl.valueChanges.pipe(startWith(dependentControl.value)),
        ]).pipe(
          switchMap(([searchTerm, dependentValue]) => {
            if (!dependentValue) {
              return of([]);
            } else {
              this.isLoading = true;
              return this.loadAndFilterOptions(searchTerm ?? '').pipe(
                tap((options) => {
                  this.availableOptions = options;
                  if (this.control.value) {
                    const selectedOption = options.find(
                      (option) =>
                        option.id === this.control.value ||
                        (this.config.valueField === 'text' &&
                          option.text === this.control.value)
                    );
                    if (selectedOption) {
                      this.displayControl.setValue(selectedOption.text, {
                        emitEvent: false,
                      });
                    }
                  }
                }),
                finalize(() => (this.isLoading = false))
              );
            }
          })
        );
      }
    } else {
      // Sin campo dependiente
      this.filteredOptions$ = this.displayControl.valueChanges.pipe(
        startWith(this.displayControl.value),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          if (this.control.disabled) {
            return of([]);
          } else {
            this.isLoading = true;
            return this.loadAndFilterOptions(searchTerm ?? '').pipe(
              tap((options) => {
                this.availableOptions = options;
                if (this.control.value) {
                  const selectedOption = options.find(
                    (option) =>
                      option.id === this.control.value ||
                      (this.config.valueField === 'text' &&
                        option.text === this.control.value)
                  );
                  if (selectedOption) {
                    this.displayControl.setValue(selectedOption.text, {
                      emitEvent: false,
                    });
                  }
                }
              }),
              finalize(() => (this.isLoading = false))
            );
          }
        })
      );
    }
  }

  loadAndFilterOptions(searchTerm: string): Observable<any[]> {
    if (!this.config.url) return of([]);

    let params = new HttpParams().set('q', searchTerm);

    // Agregar additionalParams si existen
    if (this.config.additionalParams) {
      Object.keys(this.config.additionalParams).forEach((key) => {
        const value = this.config.additionalParams![key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value);
        }
      });
    }

    if (this.config.dependentField) {
      const dependentValue = this.formGroup.get(
        this.config.dependentField
      )?.value;
      if (dependentValue) {
        params = params.set(
          this.config.dependentParamName ?? 'filter',
          dependentValue
        );
      } else {
        // Si no hay valor dependiente, no cargamos opciones
        return of([]);
      }
    }

    return this.http.get<any[]>(this.config.url, { params }).pipe(
      map((response: any) => {
        return this.filterOptions(response.data, searchTerm);
      })
    );
  }

  filterOptions(options: any[], searchTerm: string): any[] {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return options; // Si no hay término de búsqueda, mostrar todas las opciones
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return options.filter((option) =>
      option.text.toLowerCase().includes(lowerSearchTerm)
    );
  }

  onOptionSelected(event: any) {
    const selectedOption = event.option.value;
    if (selectedOption) {
      const valueToSet =
        this.config.valueField === 'text'
          ? selectedOption.text
          : selectedOption.id;
      this.control.setValue(valueToSet);
      this.displayControl.setValue(selectedOption.text, { emitEvent: false });
      this.onChange(valueToSet);
      this.onSelect.emit(selectedOption);
    }
  }

  clearInput() {
    this.control.setValue('');
    this.displayControl.setValue('', { emitEvent: false });
    this.onChange('');
  }

  addNew() {
    if (this.config.addNewDialogComponent) {
      const dialogRef = this.dialog.open(this.config.addNewDialogComponent, {
        width: '400px',
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const valueToSet =
            this.config.valueField === 'text' ? result.text : result.id;
          this.control.setValue(valueToSet);
          this.displayControl.setValue(result.text, { emitEvent: false });
          this.onChange(valueToSet);
        }
      });
    }
  }

  // Métodos para implementar ControlValueAccessor
  writeValue(value: any): void {
    if (value) {
      this.control.setValue(value);
      const selectedOption = this.availableOptions.find(
        (option) =>
          option.id === value ||
          (this.config.valueField === 'text' && option.text === value)
      );
      if (selectedOption) {
        this.displayControl.setValue(selectedOption.text, { emitEvent: false });
      }
    } else {
      this.clearInput();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
      this.displayControl.disable();
    } else {
      this.control.enable();
      this.displayControl.enable();
    }
    this.control.updateValueAndValidity();
  }

  isRequired(): boolean {
    return this.control.hasValidator(Validators.required);
  }

  // Implementación de Validator
  validate(control: AbstractControl): ValidationErrors | null {
    if (
      this.isRequired() &&
      (this.control.value == null || this.control.value === '')
    ) {
      return { required: true };
    }
    return null;
  }
}
