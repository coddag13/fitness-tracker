using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Workouts.Models
{
    public sealed record UpdateWorkoutRequest(
        int ExerciseTypeId,
        DateTimeOffset StartedAt,
        int DurationMinutes,
        int CaloriesBurned,
        int Difficulty,
        int Fatigue,
        string? Notes);
}
