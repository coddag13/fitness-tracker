import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ExerciseType } from '../../models/exercise-type.model';
import {
  ExerciseTypePresentation,
  getExerciseTypePresentation,
} from '../../models/exercise-type-presentation';

@Component({
  selector: 'app-exercise-type-selector',
  templateUrl: './exercise-type-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseTypeSelector {
  readonly exerciseTypes = input.required<ExerciseType[]>();
  readonly selectedId = input<number | null>(null);
  readonly selectedIdChange = output<number>();

  protected select(id: number): void {
    this.selectedIdChange.emit(id);
  }

  protected presentation(name: string): ExerciseTypePresentation {
    return getExerciseTypePresentation(name);
  }
}
