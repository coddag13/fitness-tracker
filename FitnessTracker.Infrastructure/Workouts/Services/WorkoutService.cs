using FitnessTracker.Application.Workouts.Interfaces;
using FitnessTracker.Application.Workouts.Models;
using FitnessTracker.Domain.Entities;
using FitnessTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Infrastructure.Workouts.Services;

public sealed class WorkoutService : IWorkoutService
{
    private readonly ApplicationDbContext _dbContext;

    public WorkoutService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<WorkoutResponse>> GetAllAsync(string userId,CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Workouts
            .AsNoTracking()
            .Where(workout => workout.UserId == userId)
            .OrderByDescending(workout => workout.StartedAt)
            .ThenByDescending(workout => workout.Id);

        var workouts = await ProjectToResponse(query)
            .ToListAsync(cancellationToken);

        return workouts;
    }

    public async Task<WorkoutResponse?> GetByIdAsync(string userId,int workoutId,CancellationToken cancellationToken = default)
    {
        return await ProjectToResponse(_dbContext.Workouts
                    .AsNoTracking()
                    .Where(workout =>workout.Id == workoutId && workout.UserId == userId))
                    .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<WorkoutResult> CreateAsync(string userId,CreateWorkoutRequest request,CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return WorkoutResult.Failure(
                new[]
                {
                    "Authenticated user identifier is required."
                });
        }

        var exerciseType = await _dbContext.ExerciseTypes
            .AsNoTracking()
            .SingleOrDefaultAsync(
                type =>
                    type.Id == request.ExerciseTypeId &&
                    type.IsActive,
                cancellationToken);

        if (exerciseType is null)
        {
            return WorkoutResult.Failure(
                new[]
                {
                    "The selected exercise type does not exist or is inactive."
                });
        }

        Workout workout;

        try
        {
            workout = new Workout(
                userId,
                request.ExerciseTypeId,
                request.StartedAt,
                request.DurationMinutes,
                request.CaloriesBurned,
                request.Difficulty,
                request.Fatigue,
                request.Notes);
        }
        catch (ArgumentException exception)
        {
            return WorkoutResult.Failure(
                new[]
                {
                    exception.Message
                });
        }

        _dbContext.Workouts.Add(workout);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = new WorkoutResponse(
            workout.Id,
            workout.ExerciseTypeId,
            exerciseType.Name,
            workout.StartedAt,
            workout.DurationMinutes,
            workout.CaloriesBurned,
            workout.Difficulty,
            workout.Fatigue,
            workout.Notes,
            workout.CreatedAt,
            workout.UpdatedAt);

        return WorkoutResult.Success(response);
    }

    private static IQueryable<WorkoutResponse> ProjectToResponse(IQueryable<Workout> query)
    {
        return query.Select(workout => new WorkoutResponse(
            workout.Id,
            workout.ExerciseTypeId,
            workout.ExerciseType.Name,
            workout.StartedAt,
            workout.DurationMinutes,
            workout.CaloriesBurned,
            workout.Difficulty,
            workout.Fatigue,
            workout.Notes,
            workout.CreatedAt,
            workout.UpdatedAt));
    }

    public async Task<WorkoutResult?> UpdateAsync(string userId,int workoutId,UpdateWorkoutRequest request,CancellationToken cancellationToken = default)
    {
        var workout = await _dbContext.Workouts
                        .SingleOrDefaultAsync(
                            workout =>
                                workout.Id == workoutId &&
                                workout.UserId == userId,
                            cancellationToken);

        if (workout is null)
        {
            return null;
        }

        var exerciseType = await _dbContext.ExerciseTypes
                            .AsNoTracking()
                            .SingleOrDefaultAsync(
                                type =>
                                    type.Id == request.ExerciseTypeId &&
                                    type.IsActive,
                                cancellationToken);

        if (exerciseType is null)
        {
            return WorkoutResult.Failure(
                new[]
                {
                "The selected exercise type does not exist or is inactive."
                });
        }

        try
        {
            workout.Update(
                request.ExerciseTypeId,
                request.StartedAt,
                request.DurationMinutes,
                request.CaloriesBurned,
                request.Difficulty,
                request.Fatigue,
                request.Notes);
        }
        catch (ArgumentException exception)
        {
            return WorkoutResult.Failure(
                new[]
                {
                exception.Message
                });
        }

        await _dbContext.SaveChangesAsync(
            cancellationToken);

        var response = new WorkoutResponse(
            workout.Id,
            workout.ExerciseTypeId,
            exerciseType.Name,
            workout.StartedAt,
            workout.DurationMinutes,
            workout.CaloriesBurned,
            workout.Difficulty,
            workout.Fatigue,
            workout.Notes,
            workout.CreatedAt,
            workout.UpdatedAt);

        return WorkoutResult.Success(response);
    }

    public async Task<bool> DeleteAsync(string userId,int workoutId,CancellationToken cancellationToken = default)
    {
        var workout = await _dbContext.Workouts
            .SingleOrDefaultAsync(
                workout =>workout.Id == workoutId && workout.UserId == userId,cancellationToken);

        if (workout is null)
        {
            return false;
        }

        _dbContext.Workouts.Remove(workout);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}