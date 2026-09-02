using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.ExerciseTypes.Models
{
    public sealed record ExerciseTypeResponse(int Id,string Name,string? Description);
}
