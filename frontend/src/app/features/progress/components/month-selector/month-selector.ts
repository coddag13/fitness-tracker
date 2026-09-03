import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-month-selector',
  imports: [FormsModule],
  templateUrl: './month-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthSelector {
  readonly value = input.required<string>();
  readonly max = input.required<string>();
  readonly valueChange = output<string>();

  protected readonly months = [
    'Januar',
    'Februar',
    'Mart',
    'April',
    'Maj',
    'Jun',
    'Jul',
    'Avgust',
    'Septembar',
    'Oktobar',
    'Novembar',
    'Decembar',
  ];
  protected readonly years = computed(() => {
    const maximumYear = Number(this.max().slice(0, 4));
    return Array.from({ length: maximumYear - 1999 }, (_, index) => maximumYear - index);
  });
  protected readonly selectedYear = computed(() => Number(this.value().slice(0, 4)));
  protected readonly selectedMonth = computed(() => Number(this.value().slice(5, 7)));

  protected changeYear(year: number): void {
    this.emitValidValue(year, this.selectedMonth());
  }

  protected changeMonth(month: number): void {
    this.emitValidValue(this.selectedYear(), month);
  }

  protected monthDisabled(month: number): boolean {
    const maximumYear = Number(this.max().slice(0, 4));
    const maximumMonth = Number(this.max().slice(5, 7));
    return this.selectedYear() === maximumYear && month > maximumMonth;
  }

  private emitValidValue(year: number, month: number): void {
    const candidate = `${year}-${String(month).padStart(2, '0')}`;
    this.valueChange.emit(candidate > this.max() ? this.max() : candidate);
  }
}
