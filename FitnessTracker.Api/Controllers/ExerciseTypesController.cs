using FitnessTracker.Application.ExerciseTypes.Interfaces;
using FitnessTracker.Application.ExerciseTypes.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTracker.Api.Controllers;

[ApiController]
[Route("api/exercise-types")]
[Authorize]
public sealed class ExerciseTypesController : ControllerBase
{
    private readonly IExerciseTypeService _exerciseTypeService;

    public ExerciseTypesController(IExerciseTypeService exerciseTypeService)
    {
        _exerciseTypeService = exerciseTypeService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<ExerciseTypeResponse>),StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyCollection<ExerciseTypeResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var exerciseTypes =await _exerciseTypeService.GetActiveAsync(cancellationToken);

        return Ok(exerciseTypes);
    }
}