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
    public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
    {
        public void Configure(
            EntityTypeBuilder<ApplicationUser> builder)
        {
            builder.Property(user => user.FirstName)
                .HasMaxLength(ApplicationUser.MaxFirstNameLength)
                .IsRequired();

            builder.Property(user => user.LastName)
                .HasMaxLength(ApplicationUser.MaxLastNameLength)
                .IsRequired();

            builder.Property(user => user.CreatedAt)
                .HasColumnType("datetimeoffset")
                .IsRequired();
        }
    }
}
