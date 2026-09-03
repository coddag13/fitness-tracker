export interface WeeklyProgress {
  weekStart: string;
  weekEnd: string;
  workoutCount: number;
  totalDurationMinutes: number;
  averageDifficulty: number;
  averageFatigue: number;
}

export interface MonthlyProgress {
  year: number;
  month: number;
  weeks: WeeklyProgress[];
}
