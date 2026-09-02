using FitnessTracker.Application.Workouts.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Workouts.Interfaces
{
    public interface IWorkoutService
    {
        Task<IReadOnlyCollection<WorkoutResponse>> GetAllAsync(string userId,CancellationToken cancellationToken = default);

        Task<WorkoutResponse?> GetByIdAsync(string userId,int workoutId,CancellationToken cancellationToken = default);

        Task<WorkoutResult> CreateAsync(string userId,CreateWorkoutRequest request,CancellationToken cancellationToken = default);
    }
}
