using MySqlConnector;

namespace DairyDemo.Auth.Data;

public static class Db
{
    public static string ConnectionString =
        "Server=localhost;Port=3306;Database=dairy_demo;Uid=root;Pwd=;SslMode=None;";

    public static MySqlConnection CreateConnection()
    {
        string? settings = Environment.GetEnvironmentVariable("DKIP_DB_CONNECTION");
        string settingsFile = Path.Combine(AppContext.BaseDirectory, "db-connection.txt");
        if (string.IsNullOrWhiteSpace(settings) && File.Exists(settingsFile))
            settings = File.ReadAllText(settingsFile).Trim();

        return new MySqlConnection(string.IsNullOrWhiteSpace(settings) ? ConnectionString : settings);
    }
}
