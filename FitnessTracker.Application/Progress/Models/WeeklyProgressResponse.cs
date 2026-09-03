using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Progress.Models;

public sealed record WeeklyProgressResponse(DateOnly WeekStart,DateOnly WeekEnd,int WorkoutCount, int TotalDurationMinutes,decimal AverageDifficulty,decimal AverageFatigue);