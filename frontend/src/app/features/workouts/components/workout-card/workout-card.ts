import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Workout } from '../../models/workout.model';
import {
  ExerciseTypePresentation,
  getExerciseTypePresentation,
} from '../../models/exercise-type-presentation';

@Component({
  selector: 'app-workout-card',
  imports: [DatePipe],
  templateUrl: './workout-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutCard {
  readonly workout = input.required<Workout>();
  readonly editRequested = output<Workout>();
  readonly deleteRequested = output<Workout>();

  protected presentation(): ExerciseTypePresentation {
    return getExerciseTypePresentation(this.workout().exerciseTypeName);
  }

  protected ratingClass(value: number): string {
    if (value <= 3) {
      return 'bg-emerald-500/15 text-emerald-300';
    }

    if (value <= 6) {
      return 'bg-yellow-500/15 text-yellow-200';
    }

    if (value <= 8) {
      return 'bg-orange-500/15 text-orange-300';
    }

    return 'bg-red-500/15 text-red-300';
  }
}
