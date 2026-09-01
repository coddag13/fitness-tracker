using FitnessTracker.Application.Authentication.Interfaces;
using FitnessTracker.Application.Authentication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTracker.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    [AllowAnonymous]
    public sealed class AuthController : ControllerBase
    {
        private readonly IAuthenticationService _authenticationService;

        public AuthController(IAuthenticationService authenticationService)
        {
            _authenticationService = authenticationService;
        }

        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthenticationResponse),StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails),StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AuthenticationResponse>> Register(RegisterRequest request)
        {
            var result = await _authenticationService.RegisterAsync(request);

            if (!result.Succeeded || result.Response is null)
            {
                var problem = new ValidationProblemDetails(
                    new Dictionary<string, string[]>
                    {
                        ["registration"] =result.Errors.ToArray()
                    })
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Registration failed."
                };

                return BadRequest(problem);
            }

            return StatusCode(StatusCodes.Status201Created,result.Response);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthenticationResponse),StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails),StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<AuthenticationResponse>> Login(LoginRequest request)
        {
            var result =await _authenticationService.LoginAsync(request);

            if (!result.Succeeded || result.Response is null)
            {
                var problem = new ProblemDetails
                {
                    Status = StatusCodes.Status401Unauthorized,
                    Title = "Authentication failed.",
                    Detail = result.Errors.FirstOrDefault()
                };

                return Unauthorized(problem);
            }

            return Ok(result.Response);
        }
    }
}
