using FitnessTracker.Domain.Entities;
using FitnessTracker.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Infrastructure.Persistence.Configurations
{
    public sealed class WorkoutConfiguration
    : IEntityTypeConfiguration<Workout>
    {
        public void Configure(EntityTypeBuilder<Workout> builder)
        {
            builder.ToTable("Workouts",tableBuilder =>
                                            {
                                                tableBuilder.HasCheckConstraint(
                                                    "CK_Workouts_DurationMinutes_Positive",
                                                    "[DurationMinutes] > 0");

                                                tableBuilder.HasCheckConstraint(
                                                    "CK_Workouts_CaloriesBurned_NonNegative",
                                                    "[CaloriesBurned] >= 0");

                                                tableBuilder.HasCheckConstraint(
                                                    "CK_Workouts_Difficulty_Range",
                                                    "[Difficulty] >= 1 AND [Difficulty] <= 10");

                                                tableBuilder.HasCheckConstraint(
                                                    "CK_Workouts_Fatigue_Range",
                                                    "[Fatigue] >= 1 AND [Fatigue] <= 10");
                                            });

            builder.HasKey(workout => workout.Id);

            builder.Property(workout => workout.UserId).HasMaxLength(450).IsRequired();

            builder.Property(workout => workout.StartedAt).HasColumnType("datetimeoffset").IsRequired();

            builder.Property(workout => workout.DurationMinutes).IsRequired();

            builder.Property(workout => workout.CaloriesBurned).IsRequired();

            builder.Property(workout => workout.Difficulty).IsRequired();

            builder.Property(workout => workout.Fatigue).IsRequired();

            builder.Property(workout => workout.Notes).HasMaxLength(Workout.MaxNotesLength);

            builder.Property(workout => workout.CreatedAt).HasColumnType("datetimeoffset").IsRequired();

            builder.Property(workout => workout.UpdatedAt).HasColumnType("datetimeoffset");

            builder.HasIndex(
                    workout => new
                    {
                        workout.UserId,
                        workout.StartedAt
                    })
                .HasDatabaseName("IX_Workouts_UserId_StartedAt");

            builder.HasOne(workout => workout.ExerciseType).WithMany().HasForeignKey(workout => workout.ExerciseTypeId).OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ApplicationUser>().WithMany().HasForeignKey(workout => workout.UserId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
