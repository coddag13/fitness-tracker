export interface WorkoutRequest {
  exerciseTypeId: number;
  startedAt: string;
  durationMinutes: number;
  caloriesBurned: number;
  difficulty: number;
  fatigue: number;
  notes: string | null;
}
