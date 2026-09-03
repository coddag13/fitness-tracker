import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { getExerciseTypePresentation } from '../../../workouts/models/exercise-type-presentation';
import { Workout } from '../../../workouts/models/workout.model';

interface WorkoutChartPoint {
  workout: Workout;
  x: number;
  difficultyY: number;
  fatigueY: number;
  dateLabel: string;
  timeLabel: string;
  typeLabel: string;
}

@Component({
  selector: 'app-workout-trend-chart',
  templateUrl: './workout-trend-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutTrendChart {
  readonly workouts = input.required<Workout[]>();

  protected readonly gridLines = [10, 8, 6, 4, 2, 0];
  protected readonly hoveredPoint = signal<WorkoutChartPoint | null>(null);
  protected readonly chartWidth = computed(() => Math.max(700, this.workouts().length * 110));
  protected readonly points = computed<WorkoutChartPoint[]>(() => {
    const workouts = this.workouts();
    const width = this.chartWidth();
    const spacing = workouts.length > 1 ? (width - 80) / (workouts.length - 1) : 0;

    return workouts.map((workout, index) => {
      const date = new Date(workout.startedAt);

      return {
        workout,
        x: workouts.length === 1 ? width / 2 : 40 + index * spacing,
        difficultyY: this.valueToY(workout.difficulty),
        fatigueY: this.valueToY(workout.fatigue),
        dateLabel: `${this.pad(date.getDate())}.${this.pad(date.getMonth() + 1)}.`,
        timeLabel: `${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`,
        typeLabel: getExerciseTypePresentation(workout.exerciseTypeName).label,
      };
    });
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

  protected showTooltip(point: WorkoutChartPoint): void {
    this.hoveredPoint.set(point);
  }

  protected hideTooltip(): void {
    this.hoveredPoint.set(null);
  }

  protected tooltipTransform(point: WorkoutChartPoint): string {
    const index = this.points().indexOf(point);

    if (index === 0) {
      return 'translateX(0)';
    }

    if (index === this.points().length - 1) {
      return 'translateX(-100%)';
    }

    return 'translateX(-50%)';
  }

  private valueToY(value: number): number {
    return 230 - value * 20;
  }

  private pad(value: number): string {
    return String(value).padStart(2, '0');
  }
}
