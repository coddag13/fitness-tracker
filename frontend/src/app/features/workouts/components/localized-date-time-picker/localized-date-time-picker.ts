import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-localized-date-time-picker',
  templateUrl: './localized-date-time-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalizedDateTimePicker {
  readonly value = input.required<string>();
  readonly max = input.required<string>();
  readonly valueChange = output<string>();

  protected readonly open = signal(false);
  protected readonly viewYear = signal(new Date().getFullYear());
  protected readonly viewMonth = signal(new Date().getMonth() + 1);
  protected readonly weekdays = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];
  protected readonly months = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
  ];
  protected readonly calendarDays = computed<(number | null)[]>(() => {
    const firstDay = new Date(this.viewYear(), this.viewMonth() - 1, 1).getDay();
    const leadingEmptyDays = (firstDay + 6) % 7;
    const numberOfDays = new Date(this.viewYear(), this.viewMonth(), 0).getDate();

    return [
      ...Array.from({ length: leadingEmptyDays }, () => null),
      ...Array.from({ length: numberOfDays }, (_, index) => index + 1),
    ];
  });
  protected readonly displayValue = computed(() => {
    const [datePart, timePart] = this.value().split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    return `${this.pad(day)}.${this.pad(month)}.${year}. · ${timePart}`;
  });
  protected readonly selectedDate = computed(() => this.value().slice(0, 10));
  protected readonly selectedHour = computed(() => Number(this.value().slice(11, 13)));
  protected readonly selectedMinute = computed(() => Number(this.value().slice(14, 16)));
  protected readonly canGoNext = computed(() => {
    const maxYear = Number(this.max().slice(0, 4));
    const maxMonth = Number(this.max().slice(5, 7));
    return this.viewYear() < maxYear || (this.viewYear() === maxYear && this.viewMonth() < maxMonth);
  });

  constructor() {
    effect(() => {
      const value = this.value();
      this.viewYear.set(Number(value.slice(0, 4)));
      this.viewMonth.set(Number(value.slice(5, 7)));
    });
  }

  protected toggle(): void {
    this.open.update((open) => !open);
  }

  protected previousMonth(): void {
    if (this.viewMonth() === 1) {
      if (this.viewYear() > 2000) {
        this.viewYear.update((year) => year - 1);
        this.viewMonth.set(12);
      }
      return;
    }

    this.viewMonth.update((month) => month - 1);
  }

  protected nextMonth(): void {
    if (!this.canGoNext()) {
      return;
    }

    if (this.viewMonth() === 12) {
      this.viewYear.update((year) => year + 1);
      this.viewMonth.set(1);
      return;
    }

    this.viewMonth.update((month) => month + 1);
  }

  protected selectDay(day: number): void {
    if (this.dayDisabled(day)) {
      return;
    }

    const date = `${this.viewYear()}-${this.pad(this.viewMonth())}-${this.pad(day)}`;
    this.emitValue(date, this.selectedHour(), this.selectedMinute());
  }

  protected changeHour(event: Event): void {
    const hour = this.clamp(Number((event.target as HTMLInputElement).value), 0, 23);
    this.emitValue(this.selectedDate(), hour, this.selectedMinute());
  }

  protected changeMinute(event: Event): void {
    const minute = this.clamp(Number((event.target as HTMLInputElement).value), 0, 59);
    this.emitValue(this.selectedDate(), this.selectedHour(), minute);
  }

  protected dayDisabled(day: number): boolean {
    return this.dateValue(day) > this.max().slice(0, 10);
  }

  protected daySelected(day: number): boolean {
    return this.dateValue(day) === this.selectedDate();
  }

  protected dayIsToday(day: number): boolean {
    return this.dateValue(day) === this.max().slice(0, 10);
  }

  private emitValue(date: string, hour: number, minute: number): void {
    const candidate = `${date}T${this.pad(hour)}:${this.pad(minute)}`;
    this.valueChange.emit(candidate > this.max() ? this.max() : candidate);
  }

  private dateValue(day: number): string {
    return `${this.viewYear()}-${this.pad(this.viewMonth())}-${this.pad(day)}`;
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(Number.isFinite(value) ? value : minimum, minimum), maximum);
  }

  private pad(value: number): string {
    return String(value).padStart(2, '0');
  }
}
