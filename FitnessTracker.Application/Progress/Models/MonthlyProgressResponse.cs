using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Progress.Models;

public sealed record MonthlyProgressResponse(int Year,int Month,IReadOnlyCollection<WeeklyProgressResponse> Weeks);