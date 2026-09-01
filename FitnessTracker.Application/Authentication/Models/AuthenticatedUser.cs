using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Authentication.Models
{
    public sealed record AuthenticatedUser(string Id,string FirstName,string LastName,string Email);
}
