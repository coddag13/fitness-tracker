using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Workouts.Models
{
    public sealed record WorkoutResult(bool Succeeded,WorkoutResponse? Response,IReadOnlyCollection<string> Errors)
    {
        public static WorkoutResult Success(WorkoutResponse response)
        {
            return new WorkoutResult(true,response,Array.Empty<string>());
        }

        public static WorkoutResult Failure(IEnumerable<string> errors)
        {
            return new WorkoutResult(false,null,errors.ToArray());
        }
    }
}
