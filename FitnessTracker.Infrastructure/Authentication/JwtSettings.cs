using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Infrastructure.Authentication
{
    public sealed class JwtSettings
    {
        public const string SectionName = "Jwt";

        public string Issuer { get; init; } = string.Empty;

        public string Audience { get; init; } = string.Empty;

        public string Key { get; init; } = string.Empty;

        public int ExpirationMinutes { get; init; } = 60;
    }
}
