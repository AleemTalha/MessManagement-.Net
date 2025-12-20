using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using MessManagement.Middleware;
using MessManagement.Utils;
using System;
using System.IO;
using System.Threading.Tasks;

namespace MessManagement.Routes
{
    public static class UploadRoutes
    {
        public static void MapUploadRoutes(this RouteGroupBuilder admin)
        {
            var upload = admin.MapGroup("/upload");

            // Apply admin authorization middleware
            upload.AddEndpointFilter(async (context, next) =>
            {
                var httpContext = context.HttpContext;
                var middleware = new AdminAuthorizationMiddleware(
                    _ => Task.CompletedTask,
                    httpContext.RequestServices.GetRequiredService<ILogger<AdminAuthorizationMiddleware>>()
                );

                var canProceed = true;
                await middleware.InvokeAsync(httpContext);

                if (httpContext.Response.StatusCode == 401 || httpContext.Response.StatusCode == 403)
                {
                    canProceed = false;
                }

                return canProceed ? await next(context) : Results.StatusCode(httpContext.Response.StatusCode);
            });

            // POST: Upload image to Cloudinary
            upload.MapPost("/", async (HttpContext httpContext) =>
            {
                try
                {
                    var cloudinaryService = httpContext.RequestServices.GetRequiredService<CloudinaryService>();
                    var form = await httpContext.Request.ReadFormAsync();
                    var imageFile = form.Files["image"];

                    if (imageFile == null || imageFile.Length == 0)
                    {
                        return Results.Json(new
                        {
                            success = false,
                            message = "No image file provided"
                        }, statusCode: 400);
                    }

                    // Validate file type
                    var allowedContentTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
                    
                    if (!allowedContentTypes.Contains(imageFile.ContentType.ToLowerInvariant()))
                    {
                        return Results.Json(new
                        {
                            success = false,
                            message = "Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed."
                        }, statusCode: 400);
                    }

                    // Validate file size (5MB max)
                    if (imageFile.Length > 5 * 1024 * 1024)
                    {
                        return Results.Json(new
                        {
                            success = false,
                            message = "File size exceeds 5MB limit"
                        }, statusCode: 400);
                    }

                    // Upload to Cloudinary
                    using var stream = imageFile.OpenReadStream();
                    var uploadResult = await cloudinaryService.UploadImageAsync(stream, imageFile.FileName, "meals");

                    if (uploadResult.Error != null)
                    {
                        return Results.Json(new
                        {
                            success = false,
                            message = $"Cloudinary upload failed: {uploadResult.Error.Message}"
                        }, statusCode: 500);
                    }

                    return Results.Json(new
                    {
                        success = true,
                        message = "Image uploaded successfully",
                        data = new
                        {
                            url = uploadResult.SecureUrl.ToString(),
                            publicId = uploadResult.PublicId
                        }
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Upload error: {ex.Message}");
                    return Results.Json(new
                    {
                        success = false,
                        message = $"Failed to upload image: {ex.Message}"
                    }, statusCode: 500);
                }
            });

            // DELETE: Delete image from Cloudinary
            upload.MapDelete("/", async (HttpContext httpContext) =>
            {
                try
                {
                    var cloudinaryService = httpContext.RequestServices.GetRequiredService<CloudinaryService>();
                    using var reader = new StreamReader(httpContext.Request.Body);
                    var body = await reader.ReadToEndAsync();
                    var data = System.Text.Json.JsonSerializer.Deserialize<DeleteImageDto>(body);

                    if (string.IsNullOrWhiteSpace(data?.PublicId))
                    {
                        return Results.Json(new
                        {
                            success = false,
                            message = "PublicId is required"
                        }, statusCode: 400);
                    }

                    var deletionResult = await cloudinaryService.DeleteImageAsync(data.PublicId);

                    if (deletionResult.Error != null)
                    {
                        return Results.Json(new
                        {
                            success = false,
                            message = $"Failed to delete image: {deletionResult.Error.Message}"
                        }, statusCode: 500);
                    }

                    return Results.Json(new
                    {
                        success = true,
                        message = "Image deleted successfully"
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Delete error: {ex.Message}");
                    return Results.Json(new
                    {
                        success = false,
                        message = $"Failed to delete image: {ex.Message}"
                    }, statusCode: 500);
                }
            });
        }
    }

    public class DeleteImageDto
    {
        public string? PublicId { get; set; }
    }
}
