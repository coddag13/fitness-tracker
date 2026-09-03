import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WeeklyProgress } from '../../models/progress.model';

@Component({
  selector: 'app-weekly-progress-card',
  templateUrl: './weekly-progress-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyProgressCard {
  readonly week = input.required<WeeklyProgress>();
  readonly weekNumber = input.required<number>();
  readonly selected = input(false);
  readonly selectedChange = output<void>();

  protected formatDate(value: string): string {
    const [, month, day] = value.split('-').map(Number);
    return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.`;
  }
}
