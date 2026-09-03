import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { ProblemDetails } from '../../models/problem-details.model';
import { RegisterRequest } from '../../models/register-request.model';
import {
  notBlankValidator,
  passwordRulesValidator,
  passwordsMatchValidator,
} from '../../validators/auth.validators';

@Component({
  selector: 'app-register-page',
  imports: [AuthShell, ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly confirmPasswordVisible = signal(false);
  protected readonly errorMessages = signal<string[]>([]);

  protected readonly form = this.formBuilder.nonNullable.group(
    {
      firstName: ['', [Validators.required, notBlankValidator, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, notBlankValidator, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), passwordRulesValidator],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  protected normalizeText(controlName: 'firstName' | 'lastName' | 'email'): void {
    const control = this.form.controls[controlName];
    control.setValue(control.value.trim());
  }

  protected togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.passwordVisible.update((visible) => !visible);
      return;
    }

    this.confirmPasswordVisible.update((visible) => !visible);
  }

  protected hasMinimumLength(): boolean {
    return this.form.controls.password.value.length >= 8;
  }

  protected hasLowercaseLetter(): boolean {
    return /[a-z]/.test(this.form.controls.password.value);
  }

  protected hasUppercaseLetter(): boolean {
    return /[A-Z]/.test(this.form.controls.password.value);
  }

  protected hasNumber(): boolean {
    return /\d/.test(this.form.controls.password.value);
  }

  protected submit(): void {
    this.normalizeText('firstName');
    this.normalizeText('lastName');
    this.normalizeText('email');
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSubmitting()) {
      return;
    }

    const value = this.form.getRawValue();
    const request: RegisterRequest = {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      password: value.password,
    };

    this.errorMessages.set([]);
    this.isSubmitting.set(true);

    this.authService
      .register(request)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigate(['/dashboard']),
        error: (error: unknown) => this.errorMessages.set(this.toFriendlyErrors(error)),
      });
  }

  private toFriendlyErrors(error: unknown): string[] {
    if (!(error instanceof HttpErrorResponse)) {
      return ['Registracija trenutno nije uspjela. Pokušaj ponovo.'];
    }

    if (error.status === 0) {
      return ['Trenutno nije moguće povezati se sa serverom. Pokušaj ponovo.'];
    }

    const problem = error.error as ProblemDetails | null;
    const serverErrors = problem?.errors
      ? Object.values(problem.errors).flat()
      : problem?.detail
        ? [problem.detail]
        : [];

    if (serverErrors.length === 0) {
      return ['Registracija nije uspjela. Provjeri unesene podatke.'];
    }

    return serverErrors.map((message) => this.translateServerError(message));
  }

  private translateServerError(message: string): string {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('already exists') || normalizedMessage.includes('already taken')) {
      return 'Nalog sa ovom email adresom već postoji.';
    }

    if (normalizedMessage.includes('uppercase')) {
      return 'Lozinka mora sadržati najmanje jedno veliko slovo.';
    }

    if (normalizedMessage.includes('lowercase')) {
      return 'Lozinka mora sadržati najmanje jedno malo slovo.';
    }

    if (normalizedMessage.includes('digit')) {
      return 'Lozinka mora sadržati najmanje jedan broj.';
    }

    if (normalizedMessage.includes('8 characters')) {
      return 'Lozinka mora imati najmanje 8 znakova.';
    }

    return 'Registracija nije uspjela. Provjeri unesene podatke.';
  }
}
