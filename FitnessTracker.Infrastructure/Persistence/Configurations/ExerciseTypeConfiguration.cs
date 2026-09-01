using FitnessTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Infrastructure.Persistence.Configurations
{
    public sealed class ExerciseTypeConfiguration
    : IEntityTypeConfiguration<ExerciseType>
    {
        public void Configure(EntityTypeBuilder<ExerciseType> builder)
        {
            builder.ToTable("ExerciseTypes");

            builder.HasKey(exerciseType => exerciseType.Id);

            builder.Property(exerciseType => exerciseType.Name).HasMaxLength(ExerciseType.MaxNameLength).IsRequired();

            builder.Property(exerciseType => exerciseType.Description).HasMaxLength(ExerciseType.MaxDescriptionLength);

            builder.Property(exerciseType => exerciseType.IsActive).HasDefaultValue(true).IsRequired();

            builder.HasIndex(exerciseType => exerciseType.Name).IsUnique();

            builder.HasData(
                new
                {
                    Id = 1,
                    Name = "Cardio",
                    Description = "Exercises focused on cardiovascular endurance.",
                    IsActive = true
                },
                new
                {
                    Id = 2,
                    Name = "Strength",
                    Description = "Exercises focused on strength and muscle development.",
                    IsActive = true
                },
                new
                {
                    Id = 3,
                    Name = "Flexibility",
                    Description = "Exercises focused on mobility and flexibility.",
                    IsActive = true
                });
        }
    }
}
