using FitnessTracker.Application.Progress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Progress.Interfaces
{
    public interface IProgressService
    {
        Task<MonthlyProgressResponse> GetMonthlyAsync(string userId,int year,int month,CancellationToken cancellationToken = default);
    }
}
