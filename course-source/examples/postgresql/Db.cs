using Npgsql;

namespace DairyDemo.Auth.Data;

public static class Db
{
    public static string ConnectionString =
        "Host=localhost;Port=5432;Database=dairy_demo;Username=postgres;Password=;Search Path=app";

    public static NpgsqlConnection CreateConnection()
    {
        string? settings = Environment.GetEnvironmentVariable("DKIP_DB_CONNECTION");
        string settingsFile = Path.Combine(AppContext.BaseDirectory, "db-connection.txt");
        if (string.IsNullOrWhiteSpace(settings) && File.Exists(settingsFile))
            settings = File.ReadAllText(settingsFile).Trim();

        return new NpgsqlConnection(string.IsNullOrWhiteSpace(settings) ? ConnectionString : settings);
    }
}
