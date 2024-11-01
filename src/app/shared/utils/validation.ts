import { UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function equalValidation(a: string, b: string, errorKey: string): ValidatorFn {
  return (formGroup: UntypedFormGroup): ValidationErrors | null => {
    if (formGroup.get(a).value === formGroup.get(b).value) {
      return null;
    } else {
      const obj: { [k: string]: any } = {};
      obj[errorKey] = true;
      return obj;
    }
  };
}
