using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Workouts.Models
{
    public sealed record WorkoutResponse(
        int Id,
        int ExerciseTypeId,
        string ExerciseTypeName,
        DateTimeOffset StartedAt,
        int DurationMinutes,
        int CaloriesBurned,
        int Difficulty,
        int Fatigue,
        string? Notes,
        DateTimeOffset CreatedAt,
        DateTimeOffset? UpdatedAt);
}
