using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Infrastructure.Identity
{
    public sealed class ApplicationUser : IdentityUser
    {
        public const int MaxFirstNameLength = 50;
        public const int MaxLastNameLength = 50;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    }
}
