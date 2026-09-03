import { computed, Injectable, signal } from '@angular/core';
import { AuthenticationResponse } from '../../features/auth/models/authentication-response.model';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly storageKey = 'fitness-tracker.session';
  private readonly storedSession = signal<AuthenticationResponse | null>(this.readStoredSession());

  readonly session = this.storedSession.asReadonly();
  readonly user = computed(() => this.storedSession()?.user ?? null);

  save(session: AuthenticationResponse): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.storedSession.set(session);
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
    this.storedSession.set(null);
  }

  accessToken(): string | null {
    const session = this.storedSession();

    if (!session) {
      return null;
    }

    if (this.isExpired(session.expiresAt)) {
      this.clear();
      return null;
    }

    return session.accessToken;
  }

  hasActiveSession(): boolean {
    return this.accessToken() !== null;
  }

  private readStoredSession(): AuthenticationResponse | null {
    const value = localStorage.getItem(this.storageKey);

    if (!value) {
      return null;
    }

    try {
      const session = JSON.parse(value) as AuthenticationResponse;

      if (!this.isValid(session) || this.isExpired(session.expiresAt)) {
        localStorage.removeItem(this.storageKey);
        return null;
      }

      return session;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private isValid(session: AuthenticationResponse): boolean {
    return Boolean(
      session?.accessToken &&
        session.expiresAt &&
        session.user?.id &&
        session.user.email,
    );
  }

  private isExpired(expiresAt: string): boolean {
    const expirationTime = Date.parse(expiresAt);
    return !Number.isFinite(expirationTime) || expirationTime <= Date.now();
  }
}
