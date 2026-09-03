import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { getExerciseTypePresentation } from '../../../workouts/models/exercise-type-presentation';
import { Workout } from '../../../workouts/models/workout.model';
import { WorkoutService } from '../../../workouts/services/workout.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly workoutService = inject(WorkoutService);

  protected readonly currentUser = inject(AuthService).currentUser;
  protected readonly workouts = signal<Workout[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly recentWorkouts = computed(() => this.workouts().slice(0, 3));
  protected readonly weeklyStats = computed(() => {
    const workouts = this.currentWeekWorkouts();
    const count = workouts.length;
    const totalDuration = workouts.reduce(
      (total, workout) => total + workout.durationMinutes,
      0,
    );
    const averageDifficulty = count
      ? workouts.reduce((total, workout) => total + workout.difficulty, 0) / count
      : null;
    const averageFatigue = count
      ? workouts.reduce((total, workout) => total + workout.fatigue, 0) / count
      : null;

    return [
      {
        label: 'Broj treninga',
        value: count.toString(),
        detail: 'ove nedjelje',
        color: 'text-orange-400',
      },
      {
        label: 'Ukupno trajanje',
        value: `${totalDuration} min`,
        detail: 'ove nedjelje',
        color: 'text-sky-400',
      },
      {
        label: 'Prosječna težina',
        value: averageDifficulty === null ? '—' : `${averageDifficulty.toFixed(1)}/10`,
        detail: averageDifficulty === null ? 'Nema unosa ove nedjelje' : 'ove nedjelje',
        color: 'text-amber-400',
      },
      {
        label: 'Prosječan umor',
        value: averageFatigue === null ? '—' : `${averageFatigue.toFixed(1)}/10`,
        detail: averageFatigue === null ? 'Nema unosa ove nedjelje' : 'ove nedjelje',
        color: 'text-emerald-400',
      },
    ];
  });

  ngOnInit(): void {
    this.loadWorkouts();
  }

  protected exerciseTypeLabel(name: string): string {
    return getExerciseTypePresentation(name).label;
  }

  protected exerciseTypeImage(name: string): string {
    return getExerciseTypePresentation(name).imageUrl;
  }

  protected retry(): void {
    this.loadWorkouts();
  }

  private currentWeekWorkouts(): Workout[] {
    const now = new Date();
    const startOfWeek = new Date(now);
    const daysSinceMonday = (now.getDay() + 6) % 7;

    startOfWeek.setDate(now.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    return this.workouts().filter((workout) => {
      const startedAt = Date.parse(workout.startedAt);
      return startedAt >= startOfWeek.getTime() && startedAt <= now.getTime();
    });
  }

  private loadWorkouts(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.workoutService
      .getAll()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (workouts) => this.workouts.set(workouts),
        error: (error: unknown) => {
          this.loadError.set(
            error instanceof HttpErrorResponse && error.status === 0
              ? 'Trenutno nije moguće povezati se sa serverom.'
              : 'Pregled aktivnosti trenutno nije moguće učitati.',
          );
        },
      });
  }
}
