using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Authentication.Models
{
    public sealed record RegisterRequest(string FirstName, string LastName,string Email,string Password);
}
