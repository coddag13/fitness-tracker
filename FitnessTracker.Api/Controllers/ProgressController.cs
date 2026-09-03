using System.IdentityModel.Tokens.Jwt;
using FitnessTracker.Application.Progress.Interfaces;
using FitnessTracker.Application.Progress.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTracker.Api.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public sealed class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    [HttpGet("monthly")]
    [ProducesResponseType(typeof(MonthlyProgressResponse),StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails),StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<MonthlyProgressResponse>> GetMonthly([FromQuery] int year,[FromQuery] int month, CancellationToken cancellationToken)
    {
        if (year is < 1 or > 9999)
        {
            return InvalidQuery("year","Year must be between 1 and 9999.");
        }

        if (month is < 1 or > 12)
        {
            return InvalidQuery("month","Month must be between 1 and 12.");
        }

        var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }

        var progress =await _progressService.GetMonthlyAsync(userId,year,month,cancellationToken);

        return Ok(progress);
    }

    private BadRequestObjectResult InvalidQuery(string field,string error)
    {
        var problem = new ValidationProblemDetails(
            new Dictionary<string, string[]>
            {
                [field] = new[] { error }
            })
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Invalid progress query."
        };

        return BadRequest(problem);
    }
}