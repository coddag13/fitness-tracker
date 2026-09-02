using FitnessTracker.Application.ExerciseTypes.Interfaces;
using FitnessTracker.Application.ExerciseTypes.Models;
using FitnessTracker.Domain.Entities;
using FitnessTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Infrastructure.ExerciseTypes.Services
{
    public sealed class ExerciseTypeService : IExerciseTypeService
    {
        private readonly ApplicationDbContext _dbContext;

        public ExerciseTypeService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IReadOnlyCollection<ExerciseTypeResponse>> GetActiveAsync(CancellationToken cancellationToken = default)
        {
            var exerciseTypes = await _dbContext.ExerciseTypes
                .AsNoTracking()
                .Where(exerciseType=>exerciseType.IsActive)
                .OrderBy(exerciseType=>exerciseType.Name)
                .Select(exerciseType=>new ExerciseTypeResponse(exerciseType.Id,exerciseType.Name,exerciseType.Description))
                .ToListAsync(cancellationToken);

            return exerciseTypes;
        }
    }
}
