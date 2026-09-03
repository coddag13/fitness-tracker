export interface Workout {
  id: number;
  exerciseTypeId: number;
  exerciseTypeName: string;
  startedAt: string;
  durationMinutes: number;
  caloriesBurned: number;
  difficulty: number;
  fatigue: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}
