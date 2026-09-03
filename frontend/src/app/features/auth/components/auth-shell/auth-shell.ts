import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShell {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
}
