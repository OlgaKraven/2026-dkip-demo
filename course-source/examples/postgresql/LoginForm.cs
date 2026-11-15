using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using DairyDemo.Auth.Services;
using DairyDemo.Auth.UI.Controls;

namespace DairyDemo.Auth.UI.Forms
{
    public sealed partial class LoginForm : Form
    {
        private readonly AuthService _auth = new();

        private readonly TextBox _tbLogin = new();
        private readonly TextBox _tbPassword = new();
        private readonly Button _btnLogin = new();
        private readonly Button _btnShuffle = new();
        private readonly Label _lblStatus = new();

        private readonly CaptchaPuzzleControl _captcha = new();

        public LoginForm()
        {
            // ---------- базовые настройки окна ----------
            Text = "Авторизация";
            Width = 520;
            Height = 520;
            MinimumSize = new Size(520, 520);
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;

            // ---------- логин ----------
            var lblLogin = new Label
            {
                Text = "Логин",
                AutoSize = true,
                Left = 20,
                Top = 20
            };

            _tbLogin.SetBounds(20, 45, 220, 28);
            _tbLogin.TabIndex = 0;

            // ---------- пароль ----------
            var lblPass = new Label
            {
                Text = "Пароль",
                AutoSize = true,
                Left = 20,
                Top = 85
            };

            _tbPassword.SetBounds(20, 110, 220, 28);
            _tbPassword.UseSystemPasswordChar = true;
            _tbPassword.TabIndex = 1;

            // ---------- кнопка входа ----------
            _btnLogin.Text = "Войти";
            _btnLogin.SetBounds(20, 155, 220, 36);
            _btnLogin.TabIndex = 2;
            _btnLogin.Click += BtnLogin_Click;

            // ---------- статус ----------
            _lblStatus.SetBounds(20, 200, 220, 100);
            _lblStatus.ForeColor = Color.DarkRed;
            _lblStatus.AutoSize = false;

            // ---------- капча ----------
            var lblCaptcha = new Label
            {
                Text = "Капча-пазл (соберите изображение)",
                AutoSize = true,
                Left = 270,
                Top = 20
            };

            _captcha.SetBounds(270, 45, 220, 220);

            // ---------- кнопка обновления капчи ----------
            _btnShuffle.Text = "Обновить пазл";
            _btnShuffle.SetBounds(270, 275, 220, 36);
            _btnShuffle.TabIndex = 3;
            _btnShuffle.Click += (_, __) => _captcha.Shuffle();

            // ---------- добавление контролов ----------
            Controls.AddRange(new Control[]
            {
                lblLogin,
                _tbLogin,
                lblPass,
                _tbPassword,
                _btnLogin,
                _lblStatus,
                lblCaptcha,
                _captcha,
                _btnShuffle
            });

            // ---------- загрузка капчи ----------
            try
            {
                var folderPath = Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory,
                    "Assets",
                    "captcha"
                );

                _captcha.LoadFromFolder(folderPath);
            }
            catch (Exception ex)
            {
                _lblStatus.Text = "Ошибка загрузки капчи: " + ex.Message;
            }
        }

        private async void BtnLogin_Click(object? sender, EventArgs e)
        {
            var login = _tbLogin.Text.Trim();
            var password = _tbPassword.Text;

            if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(password))
            {
                _lblStatus.Text = "Поля «Логин» и «Пароль» обязательны для заполнения.";
                return;
            }

            if (!_captcha.IsSolved)
            {
                _lblStatus.Text = "Соберите изображение для подтверждения.";
                return;
            }

            var (ok, message, user) = await _auth.LoginAsync(
                login,
                password,
                captchaOk: true
            );

            _lblStatus.Text = message;

            if (!ok || user is null)
                return;

            // ---------- переход по роли ----------
            Hide();
            try
            {
                if (user.Role == "admin")
                    new AdminForm(user).ShowDialog();
                else
                    new UserForm(user).ShowDialog();
            }
            finally
            {
                Close();
            }
        }
    }
}
