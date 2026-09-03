import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-rating-scale',
  templateUrl: './rating-scale.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingScale {
  readonly label = input.required<string>();
  readonly value = input<number | null>(null);
  readonly valueChange = output<number>();
  readonly values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

  protected select(value: number): void {
    this.valueChange.emit(value);
  }

  protected toneClass(value: number): string {
    if (value <= 2) {
      return 'border-emerald-500/35 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25';
    }

    if (value <= 4) {
      return 'border-lime-500/35 bg-lime-500/15 text-lime-300 hover:bg-lime-500/25';
    }

    if (value <= 6) {
      return 'border-yellow-500/35 bg-yellow-500/15 text-yellow-200 hover:bg-yellow-500/25';
    }

    if (value <= 8) {
      return 'border-orange-500/35 bg-orange-500/15 text-orange-300 hover:bg-orange-500/25';
    }

    return 'border-red-500/35 bg-red-500/15 text-red-300 hover:bg-red-500/25';
  }

  protected description(): string {
    const value = this.value();

    if (!value) {
      return 'Odaberi vrijednost';
    }

    if (value <= 2) {
      return 'Veoma lagano';
    }

    if (value <= 4) {
      return 'Lagano';
    }

    if (value <= 6) {
      return 'Umjereno';
    }

    if (value <= 8) {
      return 'Zahtjevno';
    }

    return 'Veoma zahtjevno';
  }
}
