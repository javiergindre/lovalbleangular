import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
  Validators,
} from '@angular/forms';

export class CustomValidators {
  static providerCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const isValid = /^[0-9]{10,11}$/.test(value);
      return isValid ? null : { providerCodeInvalid: true };
    };
  }

  static userPersonCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const isValid = /^[0-9]{7,8}$/.test(value);
      return isValid ? null : { userPersonCodeInvalid: true };
    };
  }
  // Validador personalizado para fechas válidas
  static dateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const dateValue = control.value;
      return isNaN(Date.parse(dateValue)) ? { invalidDate: true } : null;
    };
  }

  // Validador para coincidencia de contraseñas
  static passwordMatchValidator(
    controlName: string,
    matchingControlName: string
  ) {
    return (formGroup: FormGroup) => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      // Si matchingControl ya tiene errores que no sean passwordMatch, retornamos para no sobrescribirlos
      if (matchingControl.errors && !matchingControl.errors['passwordMatch']) {
        return null;
      }

      // Si las contraseñas no coinciden, agregamos el error
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ passwordMatch: true });
      } else {
        // Si coinciden, eliminamos el error
        matchingControl.setErrors(null);
      }

    // Asegurarse de que siempre se retorna null si no hay problemas
    return null;
    };
  }

  // Validador de números mínimos
  static minNumber(min: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean | { requiredMin: number } } | null => {
      const value = control.value;
      return value !== null && value < min ? { minNumber: { requiredMin: min } } : null;
    };
  }

  // Validador de números máximos
  static maxNumber(max: number): ValidatorFn {    
    return (control: AbstractControl): { [key: string]: boolean | { requiredMax: number } } | null => {
      const value = control.value;
      return value !== null && value > max ? { maxNumber: { requiredMax: max } } : null;
    };
  }

  // Función auxiliar para aplicar validadores dinámicamente
  static getValidators(validatorNames: string[] = []): ValidatorFn[] {
    const formValidators: ValidatorFn[] = [];

    validatorNames.forEach((name) => {
      if (name === 'required') {
        formValidators.push(Validators.required);
      }
      if (name.startsWith('minLength:')) {
        const minLength = parseInt(name.split(':')[1], 10);
        formValidators.push(Validators.minLength(minLength));
      }
      if (name.startsWith('maxLength:')) {
        const maxLength = parseInt(name.split(':')[1], 10);
        formValidators.push(Validators.maxLength(maxLength));
      }
      if (name.startsWith('minNumber:')) {
        const minNumber = parseInt(name.split(':')[1], 10);
        formValidators.push(CustomValidators.minNumber(minNumber));
      }
      if (name.startsWith('maxNumber:')) {
        const maxNumber = parseInt(name.split(':')[1], 10);
        formValidators.push(CustomValidators.maxNumber(maxNumber));
      }
      if (name === 'email') {
        formValidators.push(Validators.email);
      }
      if (name === 'date') {
        formValidators.push(CustomValidators.dateValidator());
      }
      if (name === 'passwordMatch') {
        // Este validador se maneja a nivel de grupo de formulario
      }
    });

    return formValidators;
  }
}
