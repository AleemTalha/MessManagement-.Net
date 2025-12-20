using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace MessManagement.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();

            var method = context.Request.Method;
            var path = context.Request.Path;
            var queryString = context.Request.QueryString.ToString();
            var userAgent = context.Request.Headers["User-Agent"].ToString();
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            _logger.LogInformation($"{method} {path}{queryString} - {ip} - {userAgent}");

            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();
                var statusCode = context.Response.StatusCode;
                var elapsedMs = stopwatch.ElapsedMilliseconds;

                var statusColor = GetStatusColor(statusCode);
                _logger.LogInformation($"{method} {path}{queryString} - {statusColor} - {elapsedMs}ms");
            }
        }

        private static string GetStatusColor(int statusCode)
        {
            return statusCode switch
            {
                >= 200 and < 300 => $"{statusCode} ✓",
                >= 300 and < 400 => $"{statusCode} →",
                >= 400 and < 500 => $"{statusCode} ⚠",
                >= 500 => $"{statusCode} ✗",
                _ => statusCode.ToString()
            };
        }
    }
}