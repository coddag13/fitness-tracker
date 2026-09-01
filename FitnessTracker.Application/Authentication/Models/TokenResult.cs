using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Authentication.Models
{
    public sealed record TokenResult(string AccessToken,DateTimeOffset ExpiresAt);
}
