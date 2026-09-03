import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ExerciseType } from '../../models/exercise-type.model';
import { Workout } from '../../models/workout.model';
import { WorkoutRequest } from '../../models/workout-request.model';
import { ExerciseTypeSelector } from '../exercise-type-selector/exercise-type-selector';
import { LocalizedDateTimePicker } from '../localized-date-time-picker/localized-date-time-picker';
import { RatingScale } from '../rating-scale/rating-scale';

const notInFutureValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const selectedTime = new Date(control.value).getTime();

  if (!Number.isFinite(selectedTime)) {
    return { invalidDate: true };
  }

  return selectedTime > Date.now() ? { futureDate: true } : null;
};

@Component({
  selector: 'app-workout-form-dialog',
  imports: [ExerciseTypeSelector, LocalizedDateTimePicker, RatingScale, ReactiveFormsModule],
  templateUrl: './workout-form-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutFormDialog {
  private readonly formBuilder = inject(FormBuilder);

  readonly exerciseTypes = input.required<ExerciseType[]>();
  readonly workout = input<Workout | null>(null);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);
  readonly cancelled = output<void>();
  readonly submitted = output<WorkoutRequest>();

  protected readonly maximumStartedAt = this.toLocalDateTime(new Date().toISOString());

  protected readonly form = this.formBuilder.group({
    exerciseTypeId: this.formBuilder.control<number | null>(null, Validators.required),
    startedAt: this.formBuilder.nonNullable.control(this.maximumStartedAt, [
      Validators.required,
      notInFutureValidator,
    ]),
    durationMinutes: this.formBuilder.nonNullable.control(45, [
      Validators.required,
      Validators.min(1),
    ]),
    caloriesBurned: this.formBuilder.nonNullable.control(0, [
      Validators.required,
      Validators.min(0),
    ]),
    difficulty: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(10),
    ]),
    fatigue: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(10),
    ]),
    notes: this.formBuilder.nonNullable.control('', Validators.maxLength(1000)),
  });

  constructor() {
    effect(() => {
      const workout = this.workout();

      this.form.reset(
        workout
          ? {
              exerciseTypeId: workout.exerciseTypeId,
              startedAt: this.toLocalDateTime(workout.startedAt),
              durationMinutes: workout.durationMinutes,
              caloriesBurned: workout.caloriesBurned,
              difficulty: workout.difficulty,
              fatigue: workout.fatigue,
              notes: workout.notes ?? '',
            }
          : {
              exerciseTypeId: null,
              startedAt: this.maximumStartedAt,
              durationMinutes: 45,
              caloriesBurned: 0,
              difficulty: null,
              fatigue: null,
              notes: '',
            },
      );
    });
  }

  protected selectExerciseType(id: number): void {
    this.form.controls.exerciseTypeId.setValue(id);
    this.form.controls.exerciseTypeId.markAsTouched();
  }

  protected selectRating(field: 'difficulty' | 'fatigue', value: number): void {
    this.form.controls[field].setValue(value);
    this.form.controls[field].markAsTouched();
  }

  protected selectStartedAt(value: string): void {
    this.form.controls.startedAt.setValue(value);
    this.form.controls.startedAt.markAsTouched();
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.submitting()) {
      return;
    }

    const value = this.form.getRawValue();

    this.submitted.emit({
      exerciseTypeId: value.exerciseTypeId!,
      startedAt: new Date(value.startedAt).toISOString(),
      durationMinutes: value.durationMinutes,
      caloriesBurned: value.caloriesBurned,
      difficulty: value.difficulty!,
      fatigue: value.fatigue!,
      notes: value.notes.trim() || null,
    });
  }

  private toLocalDateTime(value: string): string {
    const date = new Date(value);
    const pad = (part: number): string => part.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
