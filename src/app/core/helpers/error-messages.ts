// error-messages.ts

const ErrorMessages = {
    required: (field: string) => `${field} es requerido.`,
    minlength: (field: string, min: number) => `${field} debe tener al menos ${min} caracteres.`,
    maxlength: (field: string, max: number) => `${field} no puede exceder ${max} caracteres.`,
    email: () => `El formato de email no es válido.`,
    pattern: (field: string) => `${field} tiene un formato incorrecto.`,
    number: (field: string) => `${field} debe ser un número válido.`,
    minNumber: (field: string, min: number) => `${field} debe ser mayor o igual a ${min}.`,
    maxNumber: (field: string, max: number) => `${field} debe ser menor o igual a ${max}.`,
    invalidDate: () => `El formato de fecha no es válido.`,
    passwordMatch: () => `Las contraseñas no coinciden.`,
    customError: (message: string) => message
  };
  
  // Función que devuelve el mensaje de error basado en las validaciones del control
  export const getErrorMessage = (controlName: string, form: any, label: string): string => {
    const control = form.get(controlName);
  
    if (!control) {
      return '';
    }
  
    if (control.hasError('required')) {
      return ErrorMessages.required(label);
    }
  
    if (control.hasError('minLength')) {
      const minLength = control.getError('minLength').requiredLength;
      return ErrorMessages.minlength(label, minLength);
    }
  
    if (control.hasError('maxLength')) {
      const maxLength = control.getError('maxLength').requiredLength;
      return ErrorMessages.maxlength(label, maxLength);
    }
  
    if (control.hasError('email')) {
      return ErrorMessages.email();
    }
  
    if (control.hasError('pattern')) {
      return ErrorMessages.pattern(label);
    }
  
    if (control.hasError('minNumber')) {
      const min = control.getError('minNumber').requiredMin;
      return ErrorMessages.minNumber(label,min);
    }
  
    if (control.hasError('maxNumber')) {
      const max = control.getError('maxNumber').requiredMax;
      return ErrorMessages.maxNumber(label,max);
    }
  
    if (control.hasError('invalidDate')) {
      return ErrorMessages.invalidDate();
    }
  
    if (control.hasError('passwordMatch')) {
      return ErrorMessages.passwordMatch();
    }
  
    return ''; // Si no hay errores, no se muestra nada
  };
  