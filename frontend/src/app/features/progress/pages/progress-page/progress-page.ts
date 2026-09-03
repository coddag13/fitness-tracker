import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { MonthSelector } from '../../components/month-selector/month-selector';
import { ProgressChart } from '../../components/progress-chart/progress-chart';
import { WeeklyProgressCard } from '../../components/weekly-progress-card/weekly-progress-card';
import { WorkoutTrendChart } from '../../components/workout-trend-chart/workout-trend-chart';
import { MonthlyProgress } from '../../models/progress.model';
import { ProgressService } from '../../services/progress.service';
import { Workout } from '../../../workouts/models/workout.model';
import { WorkoutService } from '../../../workouts/services/workout.service';

@Component({
  selector: 'app-progress-page',
  imports: [MonthSelector, ProgressChart, RouterLink, WeeklyProgressCard, WorkoutTrendChart],
  templateUrl: './progress-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly progressService = inject(ProgressService);
  private readonly workoutService = inject(WorkoutService);
  private readonly today = new Date();
  private readonly monthNames = [
    'januar',
    'februar',
    'mart',
    'april',
    'maj',
    'jun',
    'jul',
    'avgust',
    'septembar',
    'oktobar',
    'novembar',
    'decembar',
  ];

  protected readonly maxMonth = this.toMonthInputValue(this.today);
  protected readonly selectedMonth = signal(this.maxMonth);
  protected readonly progress = signal<MonthlyProgress | null>(null);
  protected readonly workouts = signal<Workout[]>([]);
  protected readonly selectedWeekIndex = signal(0);
  protected readonly selectedWeek = computed(() =>
    this.progress()?.weeks[this.selectedWeekIndex()] ?? null,
  );
  protected readonly selectedWeekWorkouts = computed(() => {
    const week = this.selectedWeek();
    if (!week) {
      return [];
    }

    return this.workouts()
      .filter((workout) => {
        const workoutDate = new Date(workout.startedAt).toISOString().slice(0, 10);
        return workoutDate >= week.weekStart && workoutDate <= week.weekEnd;
      })
      .sort((first, second) => Date.parse(first.startedAt) - Date.parse(second.startedAt));
  });
  protected readonly monthLabel = computed(() => {
    const progress = this.progress();
    if (!progress) {
      return '';
    }

    const month = this.monthNames[progress.month - 1];
    return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${progress.year}.`;
  });
  protected readonly hasWorkouts = computed(() =>
    this.progress()?.weeks.some((week) => week.workoutCount > 0) ?? false,
  );
  protected readonly hasWeeksWithoutWorkouts = computed(() =>
    this.hasWorkouts() &&
    (this.progress()?.weeks.some((week) => week.workoutCount === 0) ?? false),
  );
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProgress();
  }

  protected changeMonth(value: string): void {
    this.selectedMonth.set(value);
    this.loadProgress();
  }

  protected selectWeek(index: number): void {
    this.selectedWeekIndex.set(index);
  }

  protected retry(): void {
    this.loadProgress();
  }

  protected formatDateRange(start: string, end: string): string {
    return `${this.formatDate(start)} – ${this.formatDate(end)}`;
  }

  private loadProgress(): void {
    const [year, month] = this.selectedMonth().split('-').map(Number);

    this.loading.set(true);
    this.loadError.set(null);

    forkJoin({
      progress: this.progressService.getMonthly(year, month),
      workouts: this.workoutService.getAll(),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ progress, workouts }) => {
          this.progress.set(progress);
          this.workouts.set(workouts);
          this.selectedWeekIndex.set(this.defaultWeekIndex(progress));
        },
        error: (error: unknown) => {
          this.progress.set(null);
          this.loadError.set(
            error instanceof HttpErrorResponse && error.status === 0
              ? 'Trenutno nije moguće povezati se sa serverom.'
              : 'Podatke o napretku trenutno nije moguće učitati.',
          );
        },
      });
  }

  private defaultWeekIndex(progress: MonthlyProgress): number {
    const todayValue = this.toDateValue(this.today);
    const currentWeekIndex = progress.weeks.findIndex(
      (week) => week.weekStart <= todayValue && week.weekEnd >= todayValue,
    );

    if (currentWeekIndex >= 0) {
      return currentWeekIndex;
    }

    for (let index = progress.weeks.length - 1; index >= 0; index -= 1) {
      if (progress.weeks[index].workoutCount > 0) {
        return index;
      }
    }

    return 0;
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    return `${day}. ${this.monthNames[month - 1]} ${year}.`;
  }

  private toMonthInputValue(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private toDateValue(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
