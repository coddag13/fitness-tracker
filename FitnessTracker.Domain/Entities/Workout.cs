using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Domain.Entities
{
    public sealed class Workout
    {
        public const int MinimumRating = 1;
        public const int MaximumRating = 10;
        public const int MaxNotesLength = 1000;

        public int Id { get; private set; }
        public string UserId { get; private set; } = string.Empty;
        public int ExerciseTypeId { get; private set; }
        public DateTimeOffset StartedAt { get; private set; }
        public int DurationMinutes { get; private set; }

        public int CaloriesBurned { get; private set; }

        public int Difficulty { get; private set; }

        public int Fatigue { get; private set; }

        public string? Notes { get; private set; }

        public DateTimeOffset CreatedAt { get; private set; }

        public DateTimeOffset? UpdatedAt { get; private set; }

        public ExerciseType ExerciseType { get; private set; } = null!;

        public Workout() 
        {
        }

        public Workout(string userId,int exerciseTypeId,DateTimeOffset startedAt,int durationMinutes,int caloriesBurned,int difficulty,int fatigue,string? notes = null)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("User identifier is required.",nameof(userId));
            }

            UserId = userId;
            CreatedAt = DateTimeOffset.UtcNow;

            SetDetails(exerciseTypeId,startedAt,durationMinutes,caloriesBurned,difficulty,fatigue,notes);
        }

        public void Update(int exerciseTypeId,DateTimeOffset startedAt,int durationMinutes,int caloriesBurned,int difficulty,int fatigue,string? notes)
        {
            SetDetails(exerciseTypeId,startedAt,durationMinutes,caloriesBurned,difficulty,fatigue,notes);

            UpdatedAt = DateTimeOffset.UtcNow;
        }

        private void SetDetails(int exerciseTypeId,DateTimeOffset startedAt,int durationMinutes,int caloriesBurned,int difficulty,int fatigue,string? notes)
        {
            if (exerciseTypeId <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(exerciseTypeId), "Exercise type identifier must be greater than zero.");
            }

            if (durationMinutes <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(durationMinutes),"Workout duration must be greater than zero.");
            }

            if (caloriesBurned < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(caloriesBurned),"Calories burned cannot be negative.");
            }

            ValidateRating(difficulty, nameof(difficulty));
            ValidateRating(fatigue, nameof(fatigue));

            var trimmedNotes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();

            if (trimmedNotes?.Length > MaxNotesLength)
            {
                throw new ArgumentException( $"Notes cannot exceed {MaxNotesLength} characters.", nameof(notes));
            }

            ExerciseTypeId = exerciseTypeId;
            StartedAt = startedAt;
            DurationMinutes = durationMinutes;
            CaloriesBurned = caloriesBurned;
            Difficulty = difficulty;
            Fatigue = fatigue;
            Notes = trimmedNotes;
        }

        private static void ValidateRating(int rating, string parameterName)
        {
            if (rating is < MinimumRating or > MaximumRating)
            {
                throw new ArgumentOutOfRangeException(parameterName,$"Rating must be between {MinimumRating} and {MaximumRating}.");
            }
        }
    }
}
