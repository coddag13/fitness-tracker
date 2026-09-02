using FitnessTracker.Application.ExerciseTypes.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.ExerciseTypes.Interfaces
{
    public interface IExerciseTypeService
    {
        Task<IReadOnlyCollection<ExerciseTypeResponse>> GetActiveAsync(CancellationToken cancellationToken = default);
    }
}
