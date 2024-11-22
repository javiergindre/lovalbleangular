import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { getErrorMessage } from 'src/app/core/helpers/error-messages';
import { CustomValidators } from 'src/app/core/helpers/custom-validators';
import {
  DynamicForm,
  Field,
  FieldGroup,
  FormDataDto,
  Row,
  Step,
} from './models';
import { AnamnesisService } from 'src/app/core/services/anamnesis.service';
import { componentMapping } from 'src/app/core/helpers/component-mapping';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
})
export class DynamicFormComponent implements OnInit, AfterViewInit {
  @Input() config$!: Observable<DynamicForm>;
  @Input() isLoading: boolean = true;

  form: FormGroup;
  postUrl: string = ''; // URL for form submission
  postId: string = '';
  formSubmitButton: string = '';
  formHeader: string = '';
  steps: Step[] = []; // Lista de pasos, usando la interfaz Step
  currentStep: number = 0; // Rastrea el paso actual
  stepType: number = 0;
  currentSubStep: number = 0; // Variable para el substep actual

  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef })
  container!: ViewContainerRef;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private anamnesisService: AnamnesisService,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.config$.subscribe((config) => {
      this.steps = config.steps;
      this.stepType = config.stepType;
      this.formSubmitButton = config.formSubmitButton;
      this.formHeader = config.formHeader;
      this.postUrl = config.postUrl;
      this.postId = config.postId;
      this.buildForm();

      setTimeout(() => {
        this.loadDynamicComponent();
      }, 500);
      this.isLoading = false;
    });
  }

  ngAfterViewInit(): void {
    // this.loadDynamicComponent(); // Cargar el componente dinámico después de que la vista se haya inicializado
  }

  getTemplateErrors(controlName: string): string[] {
    const control = this.form.get(controlName);
    if (control && control.errors) {
      const errorKeys = Object.keys(control.errors);

      // Solo devolver el primer error encontrado
      if (control.touched || control.dirty) {
        return [errorKeys[0]]; // Devolver el primer error de la lista
      }
    }
    return [];
  }

  // Método que llama a la función de mensajes de error
  getError(fieldName: string, fieldLabel: string): string {
    return getErrorMessage(fieldName, this.form, fieldLabel);
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Crear un objeto para almacenar los valores clave-valor
      const keyValueData: { [key: string]: any } = {};

      // Recorrer todos los controles del formulario para obtener nombre y valor
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control) {
          keyValueData[key] = control.value;
        }
      });

      // Construir el objeto FormDataDtoRq
      const formDataDtoRq: FormDataDto = {
        postId: this.postId,
        jsonData: JSON.stringify(keyValueData), // Convertir clave-valor a cadena JSON
        postUrl: this.postUrl,
      };

      // Enviar el objeto al backend
      this.anamnesisService.updateAnamnesis(formDataDtoRq).subscribe({
        next: () => {
          console.log('Form submitted successfully');
          window.location.reload();
          // Manejar el envío exitoso (por ejemplo, mostrar un mensaje de éxito, resetear el formulario, etc.)
        },
        error: (error) => console.error('Error submitting form', error),
      });
    } else {
      console.error('Form is invalid');
      // Marcar todos los campos como tocados para mostrar errores de validación
      this.markFormGroupTouched(this.form);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // TODO: revisar: no se usa
  private processSubSteps(subSteps: Step[]): any[] {
    return subSteps.map((subStep) => ({
      title: subStep.title,
      containerConfig: subStep.containerConfig,
      groups: subStep.groups.map((group) => ({
        groupName: group.groupName,
        groupConfig: group.groupConfig,
        rows: group.rows.map((row) => ({
          fields: row.fields.map((field) => {
            const formControl = this.form.get(field.name);
            let value = formControl ? formControl.value : field.value;

            // Convertir fechas a ISO string
            if (field.type === 'date' && value instanceof Date) {
              value = value.toISOString();
            }

            return {
              ...field,
              value: value,
              options: field.type === 'select' ? field.options : undefined,
            };
          }),
        })),
      })),
    }));
  }

  buildForm(): void {
    const buildControls = (groups: FieldGroup[]) => {
      groups.forEach((group: FieldGroup) => {
        group.rows.forEach((row: Row) => {
          row.fields.forEach((field: Field) => {
            const validators = CustomValidators.getValidators(
              field.validators ?? undefined
            );
            let value = field.value;

            // Convertir fechas ISO a Date
            if (field.type === 'date' && typeof value === 'string') {
              value = new Date(value);
            }

            const control = new FormControl(
              { value: value, disabled: field.disabled },
              validators
            );

            if (field.name) {
              this.form.addControl(field.name, control);
            }
          });
        });
      });
    };

    this.steps.forEach((step: Step) => {
      step.subSteps = step.subSteps || [];
      buildControls(step.groups);
      step.subSteps.forEach((subStep: Step) => {
        buildControls(subStep.groups);
      });
    });
  }

  loadDynamicComponent() {
    const dynamicField = this.steps.find((step) =>
      step.groups.some((group) =>
        group.rows.some((row) =>
          row.fields.some((field) => field.type === 'dynamic')
        )
      )
    );

    if (dynamicField) {
      this.container.clear();
      const field = dynamicField.groups[0].rows[0].fields.find(
        (f) => f.type === 'dynamic'
      );

      if (field && field.dynamicComponent) {
        const componentClass = componentMapping[field.dynamicComponent];

        if (componentClass) {
          const componentFactory =
            this.container.createComponent(componentClass);
          const instance = componentFactory.instance as any;

          const param = parseInt(field.value);
          instance.param = param;

          // Escucha los cambios del componente dinámico
          const subscription = instance['change']?.subscribe((data: any) => {
            this.form.get(field.name)!.setValue(data);
            this.form.get(field.name)!.markAsDirty();
            this.cdr.detectChanges();
          });

          componentFactory.onDestroy(() => {
            if (subscription) {
              subscription.unsubscribe();
            }
          });
        } else {
          console.error(
            'Component not found in mapping:',
            field.dynamicComponent
          );
        }
      }
    }
  }

  // Método auxiliar para formatear fechas para visualización
  formatDateForDisplay(date: Date | string): string {
    if (date instanceof Date) {
      return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
    } else if (typeof date === 'string') {
      return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') || '';
    }
    return '';
  }

  previousSubStep() {
    // Navegar al substep anterior
    this.currentSubStep = Math.max(this.currentSubStep - 1, 0);
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }
  nextSubStep() {
    const currentStepSubSteps = this.steps[this.currentStep].subSteps || [];

    // Validar solo los campos del substep actual
    const currentSubStepFields = this.getSubStepFields(
      this.currentStep,
      this.currentSubStep
    );
    if (!this.areFieldsValid(currentSubStepFields)) {
      this.markFieldsTouched(currentSubStepFields);
      return; // No avanzar si hay campos inválidos en el substep actual
    }

    // Avanzar al siguiente substep si es válido
    if (this.currentSubStep < currentStepSubSteps.length - 1) {
      this.currentSubStep += 1;
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }
  }

  // Función para regresar al paso anterior
  previousStep(): void {
    this.currentStep = Math.max(this.currentStep - 1, 0);
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  // Función para seguir al paso siguiente
  nextStep() {
    const currentStepSubSteps = this.steps[this.currentStep].subSteps || [];

    // Validar todos los substeps primero
    const allSubStepFields = currentStepSubSteps.reduce(
      (acc, _, subStepIndex) => {
        return acc.concat(
          this.getSubStepFields(this.currentStep, subStepIndex)
        );
      },
      [] as AbstractControl[]
    );

    if (!this.areFieldsValid(allSubStepFields)) {
      this.markFieldsTouched(allSubStepFields);
      return; // No avanzar si hay campos inválidos en los substeps
    }

    // Luego validar los campos del step principal
    const currentStepFields = this.getStepFields(this.currentStep);
    if (!this.areFieldsValid(currentStepFields)) {
      this.markFieldsTouched(currentStepFields);
    }

    // Si todo es válido, avanzar al siguiente step
    this.currentStep = Math.min(this.currentStep + 1, this.steps.length - 1);
    this.currentSubStep = 0; // Reiniciar el contador de substeps para el siguiente step
    this.cdr.detectChanges(); // Forzar la detección de cambios para actualizar la vista
  }

  // Verifica si el paso actual es válido antes de avanzar al siguiente paso
  isStepValid(stepIndex: number): boolean {
    const step = this.steps[stepIndex];

    // Validar los campos del step principal
    const stepFieldsValid = this.areFieldsValid(this.getStepFields(stepIndex));

    // Validar todos los substeps, si existen
    if (step.subSteps && step.subSteps.length > 0) {
      const allSubStepsValid = step.subSteps.every((_, subStepIndex) => {
        const subStepValid = this.areFieldsValid(
          this.getSubStepFields(stepIndex, subStepIndex)
        );
        return subStepValid;
      });

      return stepFieldsValid && allSubStepsValid;
    }

    return stepFieldsValid; // Si no hay substeps, solo validar el step principal
  }

  isSubStepValid(subStepIndex: number): boolean {
    // Obtener los campos del substep actual
    const subStepFields = this.getSubStepFields(this.currentStep, subStepIndex);

    // Verificar si todos los campos del substep son válidos
    return this.areFieldsValid(subStepFields);
  }

  getSubStepFields(stepIndex: number, subStepIndex: number): AbstractControl[] {
    const step = this.steps[stepIndex];

    // Asegurarse de que el subStep existe
    if (!step.subSteps || !step.subSteps[subStepIndex]) {
      return []; // Si no hay substeps o el substep no existe, devolver un array vacío
    }

    const subStep = step.subSteps[subStepIndex];

    // Extraer solo los controles del substep actual que realmente se desean validar
    const subStepFields = this.extractFieldsFromGroups(subStep.groups);

    return subStepFields;
  }

  getStepFields(stepIndex: number): AbstractControl[] {
    const step = this.steps[stepIndex];
    // Extraer solo los controles del step actual que realmente se desean validar
    const stepFields = this.extractFieldsFromGroups(step.groups);

    return stepFields;
  }

  extractFieldsFromGroups(groups: FieldGroup[]): AbstractControl[] {
    const fields: AbstractControl[] = [];
    groups.forEach((group, groupIndex) => {
      group.rows.forEach((row, rowIndex) => {
        row.fields.forEach((field, fieldIndex) => {
          const control = this.form.get(field.name);

          if (control) {
            fields.push(control); // Agregar el control específico
          }
        });
      });
    });
    return fields;
  }

  areFieldsValid(fields: AbstractControl[]): boolean {
    if (!this.form) {
      return false;
    }

    return fields.every((field) => {
      const formControl = field; // Accedemos directamente al control
      if (!formControl) {
        return false;
      }
      if (!fields || fields.length === 0) {
        return false;
      }
      // Si el campo está deshabilitado, lo consideramos válido
      const isValid = formControl.disabled || formControl.valid;
      return isValid;
    });
  }

  markFieldsTouched(fields: AbstractControl[]) {
    fields.forEach((field) => {
      field.markAsTouched();
    });
  }

  onSubStepOpened(index: number) {
    this.currentSubStep = index;
  }

  onStepOpened(index: number) {
    this.currentStep = index;
  }

  clearSelection(controlName: string): void {
    const control = this.form.get(controlName);
    if (control) {
      control.setValue(null); // Limpia la selección estableciendo el valor a null
    }
  }
}
