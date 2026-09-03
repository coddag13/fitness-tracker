import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Workout } from '../../models/workout.model';
import { getExerciseTypePresentation } from '../../models/exercise-type-presentation';

@Component({
  selector: 'app-delete-workout-dialog',
  templateUrl: './delete-workout-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteWorkoutDialog {
  readonly workout = input.required<Workout>();
  readonly deleting = input(false);
  readonly cancelled = output<void>();
  readonly confirmed = output<void>();

  protected workoutLabel(): string {
    return getExerciseTypePresentation(this.workout().exerciseTypeName).label;
  }
}
