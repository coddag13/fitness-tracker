using FitnessTracker.Application.Authentication.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Application.Authentication.Interfaces
{
    public interface IAuthenticationService
    {
        Task<AuthenticationResult> RegisterAsync(RegisterRequest request);

        Task<AuthenticationResult> LoginAsync(LoginRequest request);
    }
}
