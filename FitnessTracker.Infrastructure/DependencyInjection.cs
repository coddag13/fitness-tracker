using FitnessTracker.Infrastructure.Identity;
using FitnessTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using FitnessTracker.Application.Authentication.Interfaces;
using FitnessTracker.Infrastructure.Authentication;
using FitnessTracker.Infrastructure.Authentication.Services;
using FitnessTracker.Application.ExerciseTypes.Interfaces;
using FitnessTracker.Infrastructure.ExerciseTypes.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services,IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer(connectionString);
            });

            services.AddIdentityCore<ApplicationUser>(options =>
                {
                    options.User.RequireUniqueEmail = true;

                    options.Password.RequiredLength = 8;
                    options.Password.RequireUppercase = true;
                    options.Password.RequireLowercase = true;
                    options.Password.RequireDigit = true;
                    options.Password.RequireNonAlphanumeric = false;
                    options.Password.RequiredUniqueChars = 1;

                    options.Lockout.AllowedForNewUsers = true;
                    options.Lockout.MaxFailedAccessAttempts = 5;
                    options.Lockout.DefaultLockoutTimeSpan =
                        TimeSpan.FromMinutes(5);
                })
                .AddEntityFrameworkStores<ApplicationDbContext>();

            services.AddOptions<JwtSettings>().Bind(configuration.GetSection(JwtSettings.SectionName))
                .Validate(
                    settings => !string.IsNullOrWhiteSpace(settings.Issuer),
                    "JWT issuer is required.")
                .Validate(
                    settings => !string.IsNullOrWhiteSpace(settings.Audience),
                    "JWT audience is required.")
                .Validate(
                    settings =>
                        Encoding.UTF8.GetByteCount(settings.Key) >= 32,
                    "JWT key must contain at least 32 bytes.")
                .Validate(
                    settings => settings.ExpirationMinutes > 0,
                    "JWT expiration must be greater than zero.")
                .ValidateOnStart();

            services.AddScoped<ITokenService, JwtTokenService>();
            services.AddScoped<IAuthenticationService,AuthenticationService>();
            services.AddScoped<IExerciseTypeService,ExerciseTypeService>();

            return services;
        }
    }
}
