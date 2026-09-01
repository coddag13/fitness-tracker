using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Authentication.Models
{
    public sealed record AuthenticationResult(bool Succeeded,AuthenticationResponse? Response,IReadOnlyCollection<string> Errors)
    {
        public static AuthenticationResult Success(AuthenticationResponse response)
        {
            return new AuthenticationResult(true,response,Array.Empty<string>());
        }

        public static AuthenticationResult Failure(IEnumerable<string> errors)
        {
            return new AuthenticationResult(false,null,errors.ToArray());
        }
    }
}
