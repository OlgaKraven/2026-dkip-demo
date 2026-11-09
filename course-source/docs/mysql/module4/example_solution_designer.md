# Модуль 4. Пример решения — через дизайнер форм

Перед сборкой форм создайте таблицу и учебные записи по инструкции в [разделе про базу и учебные учётные записи](example_solution.md). После сборки проверьте [вход, блокировку и работу администратора](index.md).


!!! info "Отличие от кодового подхода"
    Здесь все формы создаются **визуально в дизайнере** Visual Studio:
    перетаскиваем контролы из Toolbox → задаём свойства → двойным кликом генерируем обработчики.
    VS автоматически создаёт файл `*.Designer.cs` с инициализацией контролов.
    В `*.cs` остаётся только **логика обработчиков**.

---

## 1. Создание проекта

1. `File → New → Project` → **Windows Forms App (.NET)**.
2. Имя проекта: `DairyDemo.Auth`, фреймворк: **.NET 8**.
3. Создайте папки: `Data/Models/`, `Data/Repositories/`, `Services/`, `UI/Controls/`, `UI/Forms/`.
4. Добавьте NuGet-пакеты (ПКМ на проекте → «Управление пакетами NuGet»):
    - `MySqlConnector`
    - `BCrypt.Net-Next`

---

## 2. Процедура создания формы через дизайнер

Для **каждой** формы:

1. ПКМ на папке `UI/Forms/` → **Add → Windows Form** → задайте имя.
2. Двойной клик на `.cs` в Solution Explorer → открывается **дизайнер**.
3. В панели **Toolbox** найдите нужный контрол → перетащите на форму.
4. В панели **Properties** (F4) задайте свойства контрола.
5. Чтобы создать обработчик события — **двойной клик** по контролу (для `Click`) или в Properties → вкладка «⚡ Events» → двойной клик по нужному событию.
6. VS создаёт метод в `*.cs` и строку подписки в `*.Designer.cs`.

---

## 3. LoginForm — дизайнер

### Контролы и свойства

| Контрол | Name | Свойства |
|---------|------|----------|
| `Label` | `lblTitle` | Text = `Вход в систему`, Font = Segoe UI 14pt Bold, AutoSize = True |
| `Label` | `lblLogin` | Text = `Логин:`, AutoSize = True |
| `TextBox` | `tbLogin` | PlaceholderText = `Логин`, Width = 220 |
| `Label` | `lblPassword` | Text = `Пароль:`, AutoSize = True |
| `TextBox` | `tbPassword` | PlaceholderText = `Пароль`, Width = 220, **UseSystemPasswordChar = True** |
| `Label` | `lblCaptcha` | Text = `Соберите изображение:`, AutoSize = True |
| `Button` | `btnLogin` | Text = `Войти`, Width = 220 |

**Свойства формы** (кликните на пустую область формы):

| Свойство | Значение |
|----------|---------|
| `Text` | `Авторизация` |
| `Size` | `300; 480` |
| `StartPosition` | `CenterScreen` |
| `FormBorderStyle` | `FixedSingle` |
| `MaximizeBox` | `False` |

Двойной клик по `btnLogin` → VS создаёт `btnLogin_Click`.

### `LoginForm.Designer.cs` (генерируется автоматически)

```csharp
namespace DairyDemo.Auth.UI.Forms;

partial class LoginForm
{
    private System.ComponentModel.IContainer components = null;

    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null)) components.Dispose();
        base.Dispose(disposing);
    }

    private void InitializeComponent()
    {
        lblTitle    = new Label();
        lblLogin    = new Label();
        tbLogin     = new TextBox();
        lblPassword = new Label();
        tbPassword  = new TextBox();
        lblCaptcha  = new Label();
        btnLogin    = new Button();
        SuspendLayout();

        lblTitle.AutoSize = true;
        lblTitle.Font     = new Font("Segoe UI", 14F, FontStyle.Bold);
        lblTitle.Location = new Point(30, 20);
        lblTitle.Text     = "Вход в систему";

        lblLogin.AutoSize = true;
        lblLogin.Location = new Point(30, 65);
        lblLogin.Text     = "Логин:";

        tbLogin.Location        = new Point(30, 85);
        tbLogin.PlaceholderText = "Логин";
        tbLogin.Size            = new Size(220, 23);

        lblPassword.AutoSize = true;
        lblPassword.Location = new Point(30, 120);
        lblPassword.Text     = "Пароль:";

        tbPassword.Location              = new Point(30, 140);
        tbPassword.PlaceholderText       = "Пароль";
        tbPassword.Size                  = new Size(220, 23);
        tbPassword.UseSystemPasswordChar = true;

        lblCaptcha.AutoSize = true;
        lblCaptcha.Location = new Point(30, 175);
        lblCaptcha.Text     = "Соберите изображение:";

        btnLogin.Location = new Point(30, 430);
        btnLogin.Size     = new Size(220, 30);
        btnLogin.Text     = "Войти";
        btnLogin.Click   += new EventHandler(btnLogin_Click);

        ClientSize      = new Size(300, 480);
        Controls.AddRange(new Control[] { lblTitle, lblLogin, tbLogin,
                                          lblPassword, tbPassword, lblCaptcha, btnLogin });
        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox     = false;
        StartPosition   = FormStartPosition.CenterScreen;
        Text            = "Авторизация";
        ResumeLayout(false);
        PerformLayout();
    }

    private Label   lblTitle;
    private Label   lblLogin;
    private TextBox tbLogin;
    private Label   lblPassword;
    private TextBox tbPassword;
    private Label   lblCaptcha;
    private Button  btnLogin;
}
```

### `LoginForm.cs` (только логика)

```csharp
using DairyDemo.Auth.Services;
using DairyDemo.Auth.UI.Controls;

namespace DairyDemo.Auth.UI.Forms;

public partial class LoginForm : Form
{
    private readonly AuthService          _auth    = new();
    private readonly CaptchaPuzzleControl _captcha = new() { Width = 220, Height = 220 };

    public LoginForm()
    {
        InitializeComponent();

        // CaptchaPuzzleControl — кастомный, добавляем вручную после InitializeComponent
        _captcha.Location = new Point(30, 200);
        Controls.Add(_captcha);

        var captchaPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "captcha");
        _captcha.LoadImages(captchaPath);
    }

    private async void btnLogin_Click(object sender, EventArgs e)
    {
        btnLogin.Enabled = false;
        try
        {
            var (ok, message, user) = await _auth.LoginAsync(
                tbLogin.Text.Trim(),
                tbPassword.Text,
                _captcha.IsSolved);

            MessageBox.Show(message, "Авторизация",
                MessageBoxButtons.OK,
                ok ? MessageBoxIcon.Information : MessageBoxIcon.Warning);

            if (ok && user is not null)
            {
                Form next = user.Role == "admin"
                    ? new AdminForm(user)
                    : new UserForm(user);

                Hide();
                next.FormClosed += (_, _) => Close();
                next.Show();
            }
            else
            {
                _captcha.Reset();
                tbPassword.Clear();
            }
        }
        finally
        {
            btnLogin.Enabled = true;
        }
    }
}
```

---

## 4. UserForm — дизайнер

### Контролы и свойства

| Контрол | Name | Свойства |
|---------|------|----------|
| `Label` | `lblWelcome` | Text = `Добро пожаловать!`, Font = Segoe UI 13pt Bold, AutoSize = True |
| `Label` | `lblRole` | Text = `Роль:`, AutoSize = True |
| `Button` | `btnLogout` | Text = `Выход`, Width = 120 |

**Свойства формы:**

| Свойство | Значение |
|----------|---------|
| `Text` | `Рабочий стол пользователя` |
| `Size` | `400; 200` |
| `StartPosition` | `CenterScreen` |
| `FormBorderStyle` | `FixedSingle` |
| `MaximizeBox` | `False` |

Двойной клик по `btnLogout` → VS создаёт `btnLogout_Click`.

### `UserForm.Designer.cs`

```csharp
namespace DairyDemo.Auth.UI.Forms;

partial class UserForm
{
    private System.ComponentModel.IContainer components = null;

    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null)) components.Dispose();
        base.Dispose(disposing);
    }

    private void InitializeComponent()
    {
        lblWelcome = new Label();
        lblRole    = new Label();
        btnLogout  = new Button();
        SuspendLayout();

        lblWelcome.AutoSize = true;
        lblWelcome.Font     = new Font("Segoe UI", 13F, FontStyle.Bold);
        lblWelcome.Location = new Point(30, 20);
        lblWelcome.Text     = "Добро пожаловать!";

        lblRole.AutoSize = true;
        lblRole.Location = new Point(30, 60);
        lblRole.Text     = "Роль:";

        btnLogout.Location = new Point(30, 95);
        btnLogout.Size     = new Size(120, 30);
        btnLogout.Text     = "Выход";
        btnLogout.Click   += new EventHandler(btnLogout_Click);

        ClientSize      = new Size(400, 160);
        Controls.AddRange(new Control[] { lblWelcome, lblRole, btnLogout });
        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox     = false;
        StartPosition   = FormStartPosition.CenterScreen;
        Text            = "Рабочий стол пользователя";
        ResumeLayout(false);
        PerformLayout();
    }

    private Label  lblWelcome;
    private Label  lblRole;
    private Button btnLogout;
}
```

### `UserForm.cs`

```csharp
using DairyDemo.Auth.Data.Models;

namespace DairyDemo.Auth.UI.Forms;

public partial class UserForm : Form
{
    public UserForm(User user)
    {
        InitializeComponent();
        lblWelcome.Text = $"Добро пожаловать, {user.Login}!";
        lblRole.Text    = $"Роль: {user.Role}";
    }

    private void btnLogout_Click(object sender, EventArgs e) => Close();
}
```

---

## 5. AdminForm — дизайнер

### Контролы и свойства

**DataGridView** (`grid`): перетащить из Toolbox, `Dock = Fill`.
В смарт-теге (`▶`) → «Edit Columns» → добавить столбцы:

| Name | DataPropertyName | HeaderText | Width | Тип |
|------|-----------------|------------|-------|-----|
| `colId` | `Id` | `ID` | 50 | TextBoxColumn |
| `colLogin` | `Login` | `Логин` | 160 | TextBoxColumn |
| `colRole` | `Role` | `Роль` | 80 | TextBoxColumn |
| `colFailed` | `FailedAttempts` | `Попытки` | 70 | TextBoxColumn |
| `colLocked` | `IsLocked` | `Заблок.` | 70 | **CheckBoxColumn** |

Также в Properties для DataGridView: `ReadOnly = True`, `SelectionMode = FullRowSelect`, `MultiSelect = False`.

**FlowLayoutPanel** (`btnPanel`): перетащить, `Dock = Bottom`, `Height = 45`.
Внутрь — 5 кнопок:

| Name | Text | Width |
|------|------|-------|
| `btnAdd` | `Добавить` | 130 |
| `btnEdit` | `Изменить` | 130 |
| `btnPwd` | `Сменить пароль` | 130 |
| `btnUnlock` | `Снять блокировку` | 150 |
| `btnRefresh` | `Обновить` | 100 |

Двойной клик по каждой кнопке → VS создаёт обработчики.
Событие `Load` формы: в Properties → Events → `Load` → двойной клик.

**Свойства формы:** `Size = 720; 480`, `StartPosition = CenterScreen`.

### `AdminForm.Designer.cs`

```csharp
namespace DairyDemo.Auth.UI.Forms;

partial class AdminForm
{
    private System.ComponentModel.IContainer components = null;

    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null)) components.Dispose();
        base.Dispose(disposing);
    }

    private void InitializeComponent()
    {
        grid       = new DataGridView();
        colId      = new DataGridViewTextBoxColumn();
        colLogin   = new DataGridViewTextBoxColumn();
        colRole    = new DataGridViewTextBoxColumn();
        colFailed  = new DataGridViewTextBoxColumn();
        colLocked  = new DataGridViewCheckBoxColumn();
        btnPanel   = new FlowLayoutPanel();
        btnAdd     = new Button();
        btnEdit    = new Button();
        btnPwd     = new Button();
        btnUnlock  = new Button();
        btnRefresh = new Button();
        ((System.ComponentModel.ISupportInitialize)grid).BeginInit();
        btnPanel.SuspendLayout();
        SuspendLayout();

        grid.AutoGenerateColumns = false;
        grid.Columns.AddRange(new DataGridViewColumn[] { colId, colLogin, colRole, colFailed, colLocked });
        grid.Dock          = DockStyle.Fill;
        grid.MultiSelect   = false;
        grid.ReadOnly      = true;
        grid.SelectionMode = DataGridViewSelectionMode.FullRowSelect;

        colId.DataPropertyName    = "Id";      colId.HeaderText    = "ID";       colId.Width    = 50;
        colLogin.DataPropertyName = "Login";   colLogin.HeaderText = "Логин";    colLogin.Width = 160;
        colRole.DataPropertyName  = "Role";    colRole.HeaderText  = "Роль";     colRole.Width  = 80;
        colFailed.DataPropertyName= "FailedAttempts"; colFailed.HeaderText = "Попытки"; colFailed.Width = 70;
        colLocked.DataPropertyName= "IsLocked"; colLocked.HeaderText = "Заблок."; colLocked.Width = 70;

        btnPanel.Controls.AddRange(new Control[] { btnAdd, btnEdit, btnPwd, btnUnlock, btnRefresh });
        btnPanel.Dock          = DockStyle.Bottom;
        btnPanel.FlowDirection = FlowDirection.LeftToRight;
        btnPanel.Height        = 45;
        btnPanel.Padding       = new Padding(5);

        btnAdd.Text    = "Добавить";        btnAdd.Width    = 130; btnAdd.Click    += new EventHandler(btnAdd_Click);
        btnEdit.Text   = "Изменить";        btnEdit.Width   = 130; btnEdit.Click   += new EventHandler(btnEdit_Click);
        btnPwd.Text    = "Сменить пароль";  btnPwd.Width    = 130; btnPwd.Click    += new EventHandler(btnPwd_Click);
        btnUnlock.Text = "Снять блокировку";btnUnlock.Width = 150; btnUnlock.Click += new EventHandler(btnUnlock_Click);
        btnRefresh.Text= "Обновить";        btnRefresh.Width= 100; btnRefresh.Click+= new EventHandler(btnRefresh_Click);

        Controls.Add(grid);
        Controls.Add(btnPanel);
        Size          = new Size(720, 480);
        StartPosition = FormStartPosition.CenterScreen;
        Text          = "Панель администратора";
        Load         += new EventHandler(AdminForm_Load);
        ((System.ComponentModel.ISupportInitialize)grid).EndInit();
        btnPanel.ResumeLayout(false);
        ResumeLayout(false);
    }

    private DataGridView              grid;
    private DataGridViewTextBoxColumn  colId, colLogin, colRole, colFailed;
    private DataGridViewCheckBoxColumn colLocked;
    private FlowLayoutPanel            btnPanel;
    private Button btnAdd, btnEdit, btnPwd, btnUnlock, btnRefresh;
}
```

### `AdminForm.cs`

```csharp
using DairyDemo.Auth.Data.Models;
using DairyDemo.Auth.Data.Repositories;
using DairyDemo.Auth.Services;

namespace DairyDemo.Auth.UI.Forms;

public partial class AdminForm : Form
{
    private readonly UserRepository _repo = new();

    public AdminForm(User admin)
    {
        InitializeComponent();
        Text = $"Панель администратора — {admin.Login}";
    }

    private async void AdminForm_Load(object sender, EventArgs e) => await LoadUsersAsync();

    private async Task LoadUsersAsync()
    {
        var users = await _repo.GetAllAsync();
        grid.DataSource = users;
    }

    private User? GetSelectedUser()
    {
        if (grid.SelectedRows.Count == 0) return null;
        return grid.SelectedRows[0].DataBoundItem as User;
    }

    private async void btnAdd_Click(object sender, EventArgs e)
    {
        using var dlg = new UserEditDialog(null);
        if (dlg.ShowDialog(this) != DialogResult.OK) return;
        if (await _repo.ExistsLoginAsync(dlg.Login))
        {
            MessageBox.Show("Пользователь с таким логином уже существует.", "Ошибка",
                MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }
        await _repo.AddUserAsync(dlg.Login, PasswordService.HashPassword(dlg.Password), dlg.Role);
        await LoadUsersAsync();
    }

    private async void btnEdit_Click(object sender, EventArgs e)
    {
        var user = GetSelectedUser();
        if (user is null) { MessageBox.Show("Выберите пользователя."); return; }
        using var dlg = new UserEditDialog(user);
        if (dlg.ShowDialog(this) != DialogResult.OK) return;
        if (await _repo.ExistsLoginAsync(dlg.Login, user.Id))
        {
            MessageBox.Show("Пользователь с таким логином уже существует.", "Ошибка",
                MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }
        await _repo.UpdateUserAsync(user.Id, dlg.Login, dlg.Role);
        await LoadUsersAsync();
    }

    private async void btnPwd_Click(object sender, EventArgs e)
    {
        var user = GetSelectedUser();
        if (user is null) { MessageBox.Show("Выберите пользователя."); return; }
        using var dlg = new PasswordDialog();
        if (dlg.ShowDialog(this) != DialogResult.OK || string.IsNullOrWhiteSpace(dlg.Password)) return;
        await _repo.UpdatePasswordAsync(user.Id, PasswordService.HashPassword(dlg.Password));
        MessageBox.Show("Пароль изменён.", "Готово", MessageBoxButtons.OK, MessageBoxIcon.Information);
    }

    private async void btnUnlock_Click(object sender, EventArgs e)
    {
        var user = GetSelectedUser();
        if (user is null) { MessageBox.Show("Выберите пользователя."); return; }
        await _repo.UnlockAsync(user.Id);
        MessageBox.Show($"Блокировка с пользователя «{user.Login}» снята.", "Готово",
            MessageBoxButtons.OK, MessageBoxIcon.Information);
        await LoadUsersAsync();
    }

    private async void btnRefresh_Click(object sender, EventArgs e) => await LoadUsersAsync();
}
```

---

## 6. Диалоговые окна

`UserEditDialog` и `PasswordDialog` — небольшие вспомогательные формы. Их удобнее создать **кодом** прямо в файле `AdminForm.cs` (как в основном решении), либо добавить отдельными формами через дизайнер по той же схеме.

Контролы `UserEditDialog`:

| Контрол | Name | Свойства |
|---------|------|----------|
| `Label` | — | Text = `Логин:` |
| `TextBox` | `tbLogin` | Width = 200 |
| `Label` | — | Text = `Пароль:` |
| `TextBox` | `tbPwd` | Width = 200, UseSystemPasswordChar = True |
| `Label` | — | Text = `Роль:` |
| `ComboBox` | `cbRole` | DropDownStyle = DropDownList, Items: `user`, `admin` |
| `Button` | `btnOk` | Text = `ОК`, DialogResult = OK |
| `Button` | `btnCancel` | Text = `Отмена`, DialogResult = Cancel |

Свойства формы: `AcceptButton = btnOk`, `CancelButton = btnCancel`, `FormBorderStyle = FixedDialog`.

---

## 7. `Program.cs`

```csharp
using DairyDemo.Auth.UI.Forms;
namespace DairyDemo.Auth;
internal static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new LoginForm());
    }
}
```