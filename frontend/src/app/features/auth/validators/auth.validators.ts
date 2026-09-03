import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const notBlankValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = typeof control.value === 'string' ? control.value.trim() : '';
  return value.length > 0 ? null : { blank: true };
};

export const passwordRulesValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = typeof control.value === 'string' ? control.value : '';
  const errors: ValidationErrors = {};

  if (!/[a-z]/.test(password)) {
    errors['lowercase'] = true;
  }

  if (!/[A-Z]/.test(password)) {
    errors['uppercase'] = true;
  }

  if (!/\d/.test(password)) {
    errors['digit'] = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordMismatch: true };
};
