using DairyDemo.Auth.Data.Models;
using DairyDemo.Auth.Data.Repositories;
using Npgsql;

namespace DairyDemo.Auth.Services;

public sealed class AuthService
{
    private readonly UserRepository _repo = new();
    private readonly PasswordService _pwd = new();

    private const string InvalidMsg =
        "Вы ввели неверный логин или пароль. Пожалуйста, проверьте ещё раз введённые данные";
    private const string LockedMsg =
        "Вы заблокированы. Обратитесь к администратору";
    private const string SuccessMsg =
        "Вы успешно авторизовались";

    public async Task<(bool ok, string message, User? user)> LoginAsync(
        string login, string password, bool captchaOk)
    {
        try
        {
            return await VerifyLoginAsync((login ?? "").Trim(), password, captchaOk);
        }
        catch (PostgresException error) when (
            error.SqlState is PostgresErrorCodes.InvalidCatalogName or PostgresErrorCodes.UndefinedTable)
        {
            return (false, "Проверьте имя базы в Launch/db-connection.txt и импортируйте SQL/dairy_demo.sql.", null);
        }
        catch (NpgsqlException)
        {
            return (false, "Не удалось подключиться к PostgreSQL. Проверьте, что сервер запущен и в Launch/db-connection.txt указаны ваш порт, пользователь и пароль PostgreSQL.", null);
        }
    }

    private async Task<(bool ok, string message, User? user)> VerifyLoginAsync(
        string login, string password, bool captchaOk)
    {
        var user = await _repo.GetByLoginAsync(login);
        if (user is null)
            return (false, InvalidMsg, null);

        if (user.IsLocked)
            return (false, LockedMsg, user);

        if (!captchaOk || !_pwd.Verify(password, user.PasswordHash))
        {
            await _repo.IncrementFailedAttemptsAndLockIfNeededAsync(user.Id);
            return (false, InvalidMsg, user);
        }

        await _repo.ResetFailedAttemptsAsync(user.Id);
        return (true, SuccessMsg, user);
    }
}
