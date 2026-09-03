import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { WeeklyProgress } from '../../models/progress.model';

interface ChartPoint {
  index: number;
  x: number;
  difficultyY: number;
  fatigueY: number;
  weekLabel: string;
  difficulty: number;
  fatigue: number;
  dateRange: string;
}

@Component({
  selector: 'app-progress-chart',
  templateUrl: './progress-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressChart {
  readonly weeks = input.required<WeeklyProgress[]>();

  protected readonly gridLines = [10, 8, 6, 4, 2, 0];
  protected readonly hoveredPoint = signal<ChartPoint | null>(null);
  protected readonly weekPositions = computed(() => {
    const weeks = this.weeks();
    const spacing = weeks.length > 1 ? 620 / (weeks.length - 1) : 0;

    return weeks.map((_, index) => ({
      x: weeks.length === 1 ? 350 : 40 + index * spacing,
      label: `N${index + 1}`,
    }));
  });
  protected readonly points = computed<ChartPoint[]>(() => {
    const weeks = this.weeks();

    return weeks
      .map((week, index) => ({ week, index }))
      .filter(({ week }) => week.workoutCount > 0)
      .map(({ week, index }) => ({
        index,
        x: this.weekPositions()[index].x,
        difficultyY: this.valueToY(week.averageDifficulty),
        fatigueY: this.valueToY(week.averageFatigue),
        weekLabel: `N${index + 1}`,
        difficulty: week.averageDifficulty,
        fatigue: week.averageFatigue,
        dateRange: `${this.formatDate(week.weekStart)} – ${this.formatDate(week.weekEnd)}`,
      }));
  });
  protected readonly difficultyLine = computed(() =>
    this.points().map((point) => `${point.x},${point.difficultyY}`).join(' '),
  );
  protected readonly fatigueLine = computed(() =>
    this.points().map((point) => `${point.x},${point.fatigueY}`).join(' '),
  );

  protected gridY(value: number): number {
    return this.valueToY(value);
  }

  protected showTooltip(point: ChartPoint): void {
    this.hoveredPoint.set(point);
  }

  protected hideTooltip(): void {
    this.hoveredPoint.set(null);
  }

  protected tooltipTransform(point: ChartPoint): string {
    if (point.index === 0) {
      return 'translateX(0)';
    }

    if (point.index === this.weeks().length - 1) {
      return 'translateX(-100%)';
    }

    return 'translateX(-50%)';
  }

  private valueToY(value: number): number {
    return 230 - value * 20;
  }

  private formatDate(value: string): string {
    const [, month, day] = value.split('-').map(Number);
    return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.`;
  }
}
