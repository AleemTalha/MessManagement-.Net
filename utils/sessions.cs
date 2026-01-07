using System;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace MessManagement.Utils
{
    public static class SessionUtils
    {
        public class SessionUser
        {
            public int? UserId { get; set; }
            public string? UserName { get; set; }
            public string? UserRole { get; set; }
            public string? UserEmail { get; set; }
        }
        public static void SetUserSession(ISession session, int userId, string name, string role, string email = "")
        {
            session.SetString("UserId", userId.ToString());
            session.SetString("UserName", name);
            session.SetString("UserRole", role);
            session.SetString("UserEmail", email);
        }

        public static SessionUser? GetUser(ISession session)
        {
            var userIdStr = session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr))
                return null;

            int.TryParse(userIdStr, out int userId);

            return new SessionUser
            {
                UserId = userId,
                UserName = session.GetString("UserName"),
                UserRole = session.GetString("UserRole"),
                UserEmail = session.GetString("UserEmail")
            };
        }

        public static bool IsUserLoggedIn(ISession session)
        {
            return !string.IsNullOrEmpty(session.GetString("UserId"));
        }
    }
}