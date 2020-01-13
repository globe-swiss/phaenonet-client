import { ValidatorFn, FormGroup, ValidationErrors } from '@angular/forms';

export function equalValidation(a: string, b: string, errorKey: string): ValidatorFn {
  return (formGroup: FormGroup): ValidationErrors | null => {
    if (formGroup.get(a).value === formGroup.get(b).value) {
      return null;
    } else {
      var obj: { [k: string]: any } = {};
      obj[errorKey] = true;
      return obj;
    }
  };
}
