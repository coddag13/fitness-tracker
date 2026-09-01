using FitnessTracker.Application.Authentication.Interfaces;
using FitnessTracker.Application.Authentication.Models;
using FitnessTracker.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Infrastructure.Authentication.Services
{
    public sealed class AuthenticationService : IAuthenticationService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;

        public AuthenticationService(UserManager<ApplicationUser> userManager,ITokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }
        public async Task<AuthenticationResult> LoginAsync(LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return InvalidCredentials();
            }

            var user = await _userManager.FindByEmailAsync(request.Email.Trim());

            if (user is null)
            {
                return InvalidCredentials();
            }

            if (await _userManager.IsLockedOutAsync(user))
            {
                return AuthenticationResult.Failure(
                    new[]
                    {
                    "The account is temporarily locked. Try again later."
                    });
            }

            var passwordIsValid =await _userManager.CheckPasswordAsync(user,request.Password);

            if (!passwordIsValid)
            {
                await _userManager.AccessFailedAsync(user);

                return InvalidCredentials();
            }

            await _userManager.ResetAccessFailedCountAsync(user);

            return CreateSuccessfulResult(user);
        }

        public async Task<AuthenticationResult> RegisterAsync(RegisterRequest request)
        {
            var validationErrors =ValidateRegistrationRequest(request);

            if (validationErrors.Count > 0)
            {
                return AuthenticationResult.Failure(validationErrors);
            }

            var email = request.Email.Trim();
            var firstName = request.FirstName.Trim();
            var lastName = request.LastName.Trim();

            var existingUser = await _userManager.FindByEmailAsync(email);

            if (existingUser is not null)
            {
                return AuthenticationResult.Failure(
                    new[]
                    {
                    "A user with this email already exists."
                    });
            }

            var user = new ApplicationUser
            {
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                UserName = email
            };

            var identityResult =await _userManager.CreateAsync(user,request.Password);

            if (!identityResult.Succeeded)
            {
                var errors = identityResult.Errors.Select(error => error.Description);

                return AuthenticationResult.Failure(errors);
            }

            return CreateSuccessfulResult(user);
        }
        private AuthenticationResult CreateSuccessfulResult(ApplicationUser user)
        {
            var authenticatedUser = new AuthenticatedUser(user.Id,user.FirstName,user.LastName,user.Email ?? string.Empty);

            var token = _tokenService.CreateToken(authenticatedUser);

            var response = new AuthenticationResponse(token.AccessToken, token.ExpiresAt,authenticatedUser);

            return AuthenticationResult.Success(response);
        }

        private static AuthenticationResult InvalidCredentials()
        {
            return AuthenticationResult.Failure(
                new[]
                {
                "Invalid email or password."
                });
        }
        private static List<string> ValidateRegistrationRequest(
         RegisterRequest request)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.FirstName))
            {
                errors.Add("First name is required.");
            }
            else if (request.FirstName.Trim().Length > ApplicationUser.MaxFirstNameLength)
            {
                errors.Add($"First name cannot exceed " +$"{ApplicationUser.MaxFirstNameLength} characters.");
            }

            if (string.IsNullOrWhiteSpace(request.LastName))
            {
                errors.Add("Last name is required.");
            }
            else if ( request.LastName.Trim().Length >ApplicationUser.MaxLastNameLength)
            {
                errors.Add($"Last name cannot exceed " +$"{ApplicationUser.MaxLastNameLength} characters.");
            }

            if (string.IsNullOrWhiteSpace(request.Email) || !MailAddress.TryCreate(request.Email.Trim(),out _))
            {
                errors.Add("A valid email address is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                errors.Add("Password is required.");
            }

            return errors;
        }
    }
}
