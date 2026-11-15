using DairyDemo.Auth.Data.Models;
using DairyDemo.Auth.Data.Repositories;
using MySqlConnector;

namespace DairyDemo.Auth.Services;

public sealed class AuthService
{
    private readonly UserRepository _repo = new();

    public async Task<(bool ok, string message, User? user)> LoginAsync(
        string login, string password, bool captchaOk)
    {
        try
        {
            return await VerifyLoginAsync(login, password, captchaOk);
        }
        catch (MySqlException error) when (
            error.ErrorCode is MySqlErrorCode.UnknownDatabase or MySqlErrorCode.NoSuchTable)
        {
            return (false, "Проверьте имя базы в Launch/db-connection.txt и импортируйте SQL/dairy_demo.sql.", null);
        }
        catch (MySqlException error) when (
            error.ErrorCode is MySqlErrorCode.AccessDenied or MySqlErrorCode.DatabaseAccessDenied)
        {
            return (false, "Проверьте имя пользователя и пароль MySQL в Launch/db-connection.txt.", null);
        }
        catch (MySqlException)
        {
            return (false, "Не удалось подключиться к MySQL. Запустите MySQL в XAMPP и сверьте Server и Port в Launch/db-connection.txt.", null);
        }
    }

    private async Task<(bool ok, string message, User? user)> VerifyLoginAsync(
        string login, string password, bool captchaOk)
    {
        var user = await _repo.GetByLoginAsync(login);
        if (user is null)
            return (false, "Вы ввели неверный логин или пароль. Пожалуйста проверьте ещё раз введенные данные", null);

        if (user.IsLocked)
            return (false, "Вы заблокированы. Обратитесь к администратору", null);

        if (!captchaOk)
        {
            await _repo.IncrementFailedAttemptsAndLockIfNeededAsync(user.Id);
            return (false, "Соберите изображение для подтверждения", null);
        }

        if (!PasswordService.Verify(password, user.PasswordHash))
        {
            await _repo.IncrementFailedAttemptsAndLockIfNeededAsync(user.Id);
            var updated = await _repo.GetByLoginAsync(login);
            if (updated?.IsLocked == true)
                return (false, "Вы заблокированы. Обратитесь к администратору", null);
            return (false, "Вы ввели неверный логин или пароль. Пожалуйста проверьте ещё раз введенные данные", null);
        }

        await _repo.ResetFailedAttemptsAsync(user.Id);
        return (true, "Вы успешно авторизовались", user);
    }
}
