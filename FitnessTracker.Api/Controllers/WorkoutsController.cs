using System.IdentityModel.Tokens.Jwt;
using FitnessTracker.Application.Workouts.Interfaces;
using FitnessTracker.Application.Workouts.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTracker.Api.Controllers;

[ApiController]
[Route("api/workouts")]
[Authorize]
public sealed class WorkoutsController : ControllerBase
{
    private readonly IWorkoutService _workoutService;

    public WorkoutsController(IWorkoutService workoutService)
    {
        _workoutService = workoutService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<WorkoutResponse>),StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task< ActionResult<IReadOnlyCollection<WorkoutResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var workouts = await _workoutService.GetAllAsync(userId,cancellationToken);

        return Ok(workouts);
    }

    [HttpGet("{id:int:min(1)}")]
    [ProducesResponseType(typeof(WorkoutResponse),StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkoutResponse>> GetById(int id,CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var workout = await _workoutService.GetByIdAsync(userId,id,cancellationToken);

        if (workout is null)
        {
            return NotFound();
        }

        return Ok(workout);
    }

    [HttpPost]
    [ProducesResponseType(typeof(WorkoutResponse),StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails),StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WorkoutResponse>> Create(CreateWorkoutRequest request,CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _workoutService.CreateAsync(userId,request,cancellationToken);

        if (!result.Succeeded || result.Response is null)
        {
            var problem = new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    ["workout"] = result.Errors.ToArray()
                })
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Workout creation failed."
            };

            return BadRequest(problem);
        }

        return CreatedAtAction(nameof(GetById),
            new
            {
                id = result.Response.Id
            },
            result.Response);
    }

    [HttpPut("{id:int:min(1)}")]
    [ProducesResponseType(typeof(WorkoutResponse),StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails),StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkoutResponse>> Update(int id,UpdateWorkoutRequest request,CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _workoutService.UpdateAsync(userId,id,request,cancellationToken);

        if (result is null)
        {
            return NotFound();
        }

        if (!result.Succeeded || result.Response is null)
        {
            var problem = new ValidationProblemDetails(
                new Dictionary<string, string[]>
                {
                    ["workout"] = result.Errors.ToArray()
                })
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Workout update failed."
            };

            return BadRequest(problem);
        }

        return Ok(result.Response);
    }


    [HttpDelete("{id:int:min(1)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id,CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var deleted = await _workoutService.DeleteAsync(userId,id,cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
    private string? GetAuthenticatedUserId()
    {
        return User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
    }
}