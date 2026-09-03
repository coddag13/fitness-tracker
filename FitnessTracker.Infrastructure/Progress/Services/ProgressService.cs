using FitnessTracker.Application.Progress.Interfaces;
using FitnessTracker.Application.Progress.Models;
using FitnessTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Infrastructure.Progress.Services;

public sealed class ProgressService : IProgressService
{
    private readonly ApplicationDbContext _dbContext;

    public ProgressService( ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<MonthlyProgressResponse> GetMonthlyAsync( string userId,int year,int month, CancellationToken cancellationToken = default)
    {
        var monthStart = new DateTimeOffset(year,month,1,0,0,0,TimeSpan.Zero);

        var monthEnd = monthStart.AddMonths(1);

        var workouts = await _dbContext.Workouts
                        .AsNoTracking()
                        .Where(workout =>
                            workout.UserId == userId &&
                            workout.StartedAt >= monthStart &&
                            workout.StartedAt < monthEnd)
                        .Select(workout => new
                        {
                            workout.StartedAt,
                            workout.DurationMinutes,
                            workout.Difficulty,
                            workout.Fatigue
                        })
                        .ToListAsync(cancellationToken);

        var weeks = new List<WeeklyProgressResponse>();

        var currentWeekStart = monthStart;

        while (currentWeekStart < monthEnd)
        {
            var daysUntilNextMonday =GetDaysUntilNextMonday(currentWeekStart.DayOfWeek);

            var nextMonday = currentWeekStart.AddDays(daysUntilNextMonday);

            var currentWeekEnd = nextMonday < monthEnd? nextMonday: monthEnd;

            var weeklyWorkouts = workouts.Where(workout =>workout.StartedAt >= currentWeekStart &&workout.StartedAt < currentWeekEnd).ToList();

            var workoutCount = weeklyWorkouts.Count;

            var totalDuration = weeklyWorkouts.Sum(workout => workout.DurationMinutes);

            var averageDifficulty = workoutCount == 0? 0: Math.Round(weeklyWorkouts.Average(workout =>(decimal)workout.Difficulty),2);

            var averageFatigue = workoutCount == 0
                ? 0 : Math.Round(weeklyWorkouts.Average(workout =>(decimal)workout.Fatigue),2);

            weeks.Add(
                new WeeklyProgressResponse(
                    DateOnly.FromDateTime(
                        currentWeekStart.Date),
                    DateOnly.FromDateTime(
                        currentWeekEnd.AddDays(-1).Date),
                    workoutCount,
                    totalDuration,
                    averageDifficulty,
                    averageFatigue));

            currentWeekStart = currentWeekEnd;
        }

        return new MonthlyProgressResponse(year,month,weeks);
    }

    private static int GetDaysUntilNextMonday(DayOfWeek currentDay)
    {
        var days =((int)DayOfWeek.Monday -(int)currentDay +7) % 7;

        return days == 0 ? 7: days;
    }
}