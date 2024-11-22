import { AbstractControl, ValidatorFn } from '@angular/forms';

export function periodValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const value = control.value;
        if (!value) {
            return null;
        }

        const valid = /^(0[1-9]|1[0-2])\d{4}$/.test(value);
        return valid ? null : { 'invalidPeriod': { value: control.value } };
    };
}

