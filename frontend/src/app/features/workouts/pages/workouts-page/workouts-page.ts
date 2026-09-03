import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-workouts-page',
  templateUrl: './workouts-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutsPage {}
