using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MessManagement.Models;

namespace MessManagement.Utils
{
    public static class JwtUtils
    {
        public static string GenerateJwtToken(User user, IConfiguration configuration)
        {
            var jwtSecret = configuration["JwtSettings:jwtSecret"];
            if (string.IsNullOrEmpty(jwtSecret))
                throw new InvalidOperationException("JWT secret is not configured");

            var expiryInMinutes = int.Parse(configuration["JwtSettings:expiryInMinutes"] ?? "60");
            var audience = configuration["JwtSettings:audience"];
            var issuer = configuration["JwtSettings:issuer"];
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.Name),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("role", user.Role), // Add custom role claim for easier access
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };


            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryInMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public static ClaimsPrincipal? VerifyJwtToken(string token, IConfiguration configuration)
        {
            try
            {
                var jwtSecret = configuration["JwtSettings:jwtSecret"];
                if (string.IsNullOrEmpty(jwtSecret))
                    throw new InvalidOperationException("JWT secret is not configured");

                var audience = configuration["JwtSettings:audience"];
                var issuer = configuration["JwtSettings:issuer"];
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = securityKey
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
                return principal;
            }
            catch (Exception err)
            {
                Console.WriteLine("Error verifying JWT token: " + err.Message);
                return null;
            }
        }

    }
}