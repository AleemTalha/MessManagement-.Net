using Microsoft.AspNetCore.Builder;
using MessManagement.Data;
using MessManagement.Models;
using MessManagement.Routes;
using Microsoft.EntityFrameworkCore;

namespace MessManagement.Routes
{
    public static class ApiRoutes
    {
        public static void MapApiRoutes(this WebApplication app)
        {
            var api = app.MapGroup("/api");
             api.MapAdminRoutes();
             api.MapUserRoutes();
        }
    }
}