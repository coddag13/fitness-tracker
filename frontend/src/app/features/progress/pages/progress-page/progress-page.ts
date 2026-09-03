import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-progress-page',
  templateUrl: './progress-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressPage {}
