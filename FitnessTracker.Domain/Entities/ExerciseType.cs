using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Domain.Entities
{
    public sealed class ExerciseType
    {
        public const int MaxNameLength = 100;
        public const int MaxDescriptionLength = 500;

        public int Id {  get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public bool IsActive { get; private set; } = true;
        public ExerciseType() 
        { 
        }
        public ExerciseType(string name,string? description=null) 
        { 
            SetDetails(name,description);
        }
        public void Activate()
        {
            IsActive = true;
        }
        public void Deactivate()
        {
            IsActive = false;
        }

        private void SetDetails(string name, string? description)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException(
                    "Exercise type name is required.",
                    nameof(name));
            }

            var trimmedName = name.Trim();

            if (trimmedName.Length > MaxNameLength)
            {
                throw new ArgumentException(
                    $"Exercise type name cannot exceed {MaxNameLength} characters.",
                    nameof(name));
            }

            var trimmedDescription = string.IsNullOrWhiteSpace(description)
                ? null
                : description.Trim();

            if (trimmedDescription?.Length > MaxDescriptionLength)
            {
                throw new ArgumentException(
                    $"Description cannot exceed {MaxDescriptionLength} characters.",
                    nameof(description));
            }

            Name = trimmedName;
            Description = trimmedDescription;
        }
    }
}
