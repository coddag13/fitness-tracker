import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { DeleteWorkoutDialog } from '../../components/delete-workout-dialog/delete-workout-dialog';
import { WorkoutCard } from '../../components/workout-card/workout-card';
import { WorkoutFormDialog } from '../../components/workout-form-dialog/workout-form-dialog';
import { ExerciseType } from '../../models/exercise-type.model';
import { getExerciseTypePresentation } from '../../models/exercise-type-presentation';
import { Workout } from '../../models/workout.model';
import { WorkoutRequest } from '../../models/workout-request.model';
import { ExerciseTypeService } from '../../services/exercise-type.service';
import { WorkoutService } from '../../services/workout.service';

@Component({
  selector: 'app-workouts-page',
  imports: [DeleteWorkoutDialog, WorkoutCard, WorkoutFormDialog],
  templateUrl: './workouts-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutsPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly exerciseTypeService = inject(ExerciseTypeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutService = inject(WorkoutService);

  protected readonly workouts = signal<Workout[]>([]);
  protected readonly exerciseTypes = signal<ExerciseType[]>([]);
  protected readonly selectedExerciseTypeId = signal<number | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 9;
  protected readonly filteredWorkouts = computed(() => {
    const selectedId = this.selectedExerciseTypeId();
    return selectedId === null
      ? this.workouts()
      : this.workouts().filter((workout) => workout.exerciseTypeId === selectedId);
  });
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredWorkouts().length / this.pageSize)),
  );
  protected readonly paginatedWorkouts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredWorkouts().slice(start, start + this.pageSize);
  });
  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly editingWorkout = signal<Workout | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly workoutToDelete = signal<Workout | null>(null);
  protected readonly deleting = signal(false);
  protected readonly notice = signal<string | null>(null);
  protected readonly errorNotice = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  protected retry(): void {
    this.loadData();
  }

  protected filterByExerciseType(id: number | null): void {
    this.selectedExerciseTypeId.set(id);
    this.currentPage.set(1);
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected exerciseTypeLabel(name: string): string {
    return getExerciseTypePresentation(name).label;
  }

  protected openCreateForm(): void {
    this.editingWorkout.set(null);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEditForm(workout: Workout): void {
    this.editingWorkout.set(workout);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingWorkout.set(null);
    this.formError.set(null);
  }

  protected saveWorkout(request: WorkoutRequest): void {
    if (this.saving()) {
      return;
    }

    const workout = this.editingWorkout();
    const operation = workout
      ? this.workoutService.update(workout.id, request)
      : this.workoutService.create(request);

    this.saving.set(true);
    this.formError.set(null);

    operation
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (savedWorkout) => {
          this.workouts.update((workouts) =>
            this.sortByNewest(
              workout
                ? workouts.map((item) =>
                    item.id === savedWorkout.id ? savedWorkout : item,
                  )
                : [savedWorkout, ...workouts],
            ),
          );
          this.currentPage.set(1);
          this.formOpen.set(false);
          this.editingWorkout.set(null);
          this.showNotice(workout ? 'Trening je uspešno izmenjen.' : 'Trening je uspešno dodat.');
        },
        error: (error: unknown) => this.formError.set(this.friendlySaveError(error)),
      });
  }

  protected requestDelete(workout: Workout): void {
    this.workoutToDelete.set(workout);
  }

  protected cancelDelete(): void {
    if (!this.deleting()) {
      this.workoutToDelete.set(null);
    }
  }

  protected confirmDelete(): void {
    const workout = this.workoutToDelete();

    if (!workout || this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.workoutService
      .delete(workout.id)
      .pipe(
        finalize(() => this.deleting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.workouts.update((workouts) =>
            workouts.filter((item) => item.id !== workout.id),
          );
          this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
          this.workoutToDelete.set(null);
          this.showNotice('Trening je obrisan.');
        },
        error: (error: unknown) => {
          this.workoutToDelete.set(null);
          this.showErrorNotice(this.friendlyDeleteError(error));
        },
      });
  }

  private loadData(): void {
    this.loading.set(true);
    this.loadError.set(null);

    forkJoin({
      workouts: this.workoutService.getAll(),
      exerciseTypes: this.exerciseTypeService.getAll(),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ workouts, exerciseTypes }) => {
          this.workouts.set(this.sortByNewest(workouts));
          this.exerciseTypes.set(exerciseTypes);

          if (this.route.snapshot.queryParamMap.get('create') === 'true') {
            this.openCreateForm();
            void this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { create: null },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          }
        },
        error: (error: unknown) => this.loadError.set(this.friendlyLoadError(error)),
      });
  }

  private sortByNewest(workouts: Workout[]): Workout[] {
    return [...workouts].sort(
      (first, second) => Date.parse(second.startedAt) - Date.parse(first.startedAt),
    );
  }

  private friendlyLoadError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'Trenutno nije moguće povezati se sa serverom. Pokušaj ponovo.';
    }

    return 'Treninge trenutno nije moguće učitati. Pokušaj ponovo.';
  }

  private friendlySaveError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'Trenutno nije moguće povezati se sa serverom. Pokušaj ponovo.';
    }

    if (error instanceof HttpErrorResponse && error.status === 400) {
      const messages = Object.values(error.error?.errors ?? {}).flat() as string[];
      const message = messages.join(' ').toLowerCase();

      if (message.includes('future')) {
        return 'Datum i vreme treninga ne mogu biti u budućnosti.';
      }

      if (message.includes('exercise type')) {
        return 'Odabrana vrsta treninga nije dostupna.';
      }

      if (message.includes('duration')) {
        return 'Trajanje treninga mora biti veće od nule.';
      }

      if (message.includes('rating')) {
        return 'Težina i umor moraju biti između 1 i 10.';
      }

      if (message.includes('notes')) {
        return 'Beleška može imati najviše 1000 znakova.';
      }

      return 'Proveri unesene podatke i pokušaj ponovo.';
    }

    if (error instanceof HttpErrorResponse && error.status === 404) {
      return 'Traženi trening više ne postoji.';
    }

    return 'Trening trenutno nije moguće sačuvati. Pokušaj ponovo.';
  }

  private friendlyDeleteError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      return 'Trening je već uklonjen. Osveži listu i pokušaj ponovo.';
    }

    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'Nema veze sa serverom. Trening nije obrisan.';
    }

    return 'Trening trenutno nije moguće obrisati. Pokušaj ponovo.';
  }

  private showNotice(message: string): void {
    this.notice.set(message);
    window.setTimeout(() => this.notice.set(null), 3500);
  }

  private showErrorNotice(message: string): void {
    this.errorNotice.set(message);
    window.setTimeout(() => this.errorNotice.set(null), 4500);
  }
}
