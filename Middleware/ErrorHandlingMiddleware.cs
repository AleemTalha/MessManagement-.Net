using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace MessManagement.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public ErrorHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (BadHttpRequestException ex)
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status400BadRequest;

                var response = new
                {
                    status = "error",
                    statusCode = 400,
                    message = "Invalid request format or missing required fields",
                    details = ex.Message
                };

                await context.Response.WriteAsJsonAsync(response);
            }
            catch (Exception ex)
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                var response = new
                {
                    status = "error",
                    statusCode = 500,
                    message = "An unexpected error occurred",
                    details = ex.Message
                };

                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }
}
