using FitnessTracker.Application.Authentication.Interfaces;
using FitnessTracker.Application.Authentication.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace FitnessTracker.Infrastructure.Authentication.Services
{
    public sealed class JwtTokenService : ITokenService
    {
        private readonly JwtSettings _settings;

        public JwtTokenService(IOptions<JwtSettings> options)
        {
            _settings = options.Value;
        }

        public TokenResult CreateToken(AuthenticatedUser user)
        {
            var issuedAt = DateTimeOffset.UtcNow;

            var expiresAt = issuedAt.AddMinutes(_settings.ExpirationMinutes);

            var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub,user.Id),

            new(JwtRegisteredClaimNames.Email,user.Email),

            new(JwtRegisteredClaimNames.GivenName,user.FirstName),

            new(JwtRegisteredClaimNames.FamilyName,user.LastName),

            new(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString())
        };

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));

            var signingCredentials = new SigningCredentials(securityKey,SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(issuer: _settings.Issuer,audience: _settings.Audience,claims: claims,notBefore: issuedAt.UtcDateTime,expires: expiresAt.UtcDateTime,signingCredentials: signingCredentials);

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

            return new TokenResult(accessToken,expiresAt);
        }
    }
}
