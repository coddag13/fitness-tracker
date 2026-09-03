import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { LoginRequest } from '../../models/login-request.model';

@Component({
  selector: 'app-login-page',
  imports: [AuthShell, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly sessionExpired =
    this.route.snapshot.queryParamMap.get('sessionExpired') === 'true';

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    password: ['', Validators.required],
  });

  protected normalizeEmail(): void {
    const emailControl = this.form.controls.email;
    emailControl.setValue(emailControl.value.trim());
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected submit(): void {
    this.normalizeEmail();
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSubmitting()) {
      return;
    }

    const request: LoginRequest = this.form.getRawValue();

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authService
      .login(request)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl(this.safeReturnUrl()),
        error: (error: unknown) => this.errorMessage.set(this.toFriendlyError(error)),
      });
  }

  private safeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
      ? returnUrl
      : '/dashboard';
  }

  private toFriendlyError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Trenutno nije moguće povezati se sa serverom. Pokušaj ponovo.';
      }

      if (error.status === 401) {
        const detail = typeof error.error?.detail === 'string' ? error.error.detail : '';

        return detail.toLowerCase().includes('locked')
          ? 'Nalog je privremeno zaključan. Pokušaj ponovo za nekoliko minuta.'
          : 'Email ili lozinka nisu ispravni.';
      }
    }

    return 'Prijava trenutno nije uspela. Pokušaj ponovo.';
  }
}
