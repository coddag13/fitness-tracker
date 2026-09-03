import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Navigation } from '../navigation/navigation';

@Component({
  selector: 'app-shell',
  imports: [Navigation, RouterLink, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  private readonly authService = inject(AuthService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly mobileMenuOpen = signal(false);

  protected fullName(): string {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  protected initials(): string {
    const user = this.currentUser();
    return user
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
      : 'FT';
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected logout(): void {
    this.mobileMenuOpen.set(false);
    this.authService.logout();
  }
}
