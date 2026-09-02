using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Workouts.Models
{
    //UserId is not part of this request it will be taken from JWT token so that way one user can't make workout for another
    public sealed record CreateWorkoutRequest(
    int ExerciseTypeId,
    DateTimeOffset StartedAt,
    int DurationMinutes,
    int CaloriesBurned,
    int Difficulty,
    int Fatigue,
    string? Notes);
}
