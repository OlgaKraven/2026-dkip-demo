export function addApplicationSteps({step, grid, code, image, lesson, doc, example, examplesPage, data}) {
  const sourceLinks = [example, examplesPage];
  step('Требования к интерфейсу', [
    'Откройте приложение М4 и PDF «Требования к разработке». Найдите требования к макету, ошибкам и обратной связи.',
    'Распакуйте четыре PNG из приложения М4. Откройте каждый файл в просмотрщике.',
  ], 'Доступны четыре фрагмента и условия для проверки формы.', {links:[doc(3,/\.pdf$/)]});
  step('Таблица users и учебные записи', [
    'Распакуйте готовый пример в отдельную папку. В phpMyAdmin выберите dairy_demo → «Импорт».',
    'Выберите SQL/demo-users.sql и нажмите «Вперёд». Откройте users → «Структура».',
    'Проверьте PRIMARY для id, UNIQUE для login, начальное значение 0 для счётчика и блокировки.',
  ], 'В «Обзоре» две учебные записи. Пароли хранятся в виде хешей.', {links:sourceLinks});
  step('Создание проекта в Visual Studio', [
    'Откройте «Файл» → «Создать» → «Проект». Введите Windows Forms App в поиске шаблонов.',
    'Выберите шаблон C# для .NET. Назовите проект DairyDemo.Auth и укажите .NET 8.',
    'В обозревателе решений нажмите ПКМ по проекту → Add → New Folder. Создайте Data, Services и UI.',
  ], 'Создан проект Windows Forms на .NET 8.', {links:[lesson('M4',/Создание проекта/)]});
  step('Подключение NuGet', [
    'Нажмите ПКМ по проекту → «Управление пакетами NuGet» → «Обзор».',
    'Найдите MySqlConnector и установите версию 2.6.1. Затем установите BCrypt.Net-Next 4.0.3.',
    'Раскройте «Зависимости» → «Пакеты».',
  ], 'Оба пакета видны в списке зависимостей.', {links:sourceLinks});
  step('Файлы данных и сервисов', [
    'В Data создайте подпапки Models и Repositories. В UI создайте Controls и Forms.',
    'Скопируйте Data/Db.cs, Data/Models/User.cs, Data/Repositories/UserRepository.cs и два файла из Services готового примера.',
    'Для каждого файла откройте нужную папку в Solution Explorer и используйте Add → Existing Item, если файл ещё не виден.',
  ], 'В проекте есть подключение, модель User, репозиторий, PasswordService и AuthService.', {image:image(28,'Структура учебного проекта в Visual Studio'),links:[example]});
  step('Настройка соединения с MySQL', [
    'Откройте Data/Db.cs. В phpMyAdmin проверьте имя базы и сверяйте порт со строкой MySQL в XAMPP.',
    'Укажите в ConnectionString адрес, порт, Database, Uid и Pwd вашего учебного подключения.',
    'Откройте Build → Build Solution. Если NuGet ещё восстанавливает пакеты, дождитесь завершения.',
  ], 'Проект собирается. В ConnectionString указана база dairy_demo с таблицей users.', {links:sourceLinks});
  step('Файлы и контрол капчи', [
    'Скопируйте UI/Controls/CaptchaPuzzleControl.cs из примера. Добавьте папку Assets/captcha и четыре файла 1.png–4.png.',
    'В свойствах файлов поставьте Build Action = Content и Copy to Output Directory = Copy if newer.',
    'Соберите проект. Проверьте, что в bin/Debug/net8.0-windows/Assets/captcha есть четыре PNG.',
  ], 'Файлы доступны из папки запуска. Контрол переставляет два фрагмента по последовательным щелчкам.', {image:image(29,'Собранный пазл из материалов курса'),links:[example]});
  step('Новая форма LoginForm', [
    'В Solution Explorer нажмите ПКМ по UI/Forms → Add → Windows Form. Введите LoginForm.cs.',
    'Откройте View Designer, затем View → Toolbox и Properties клавишей F4. В файлах формы проверьте namespace DairyDemo.Auth.UI.Forms.',
    'Щёлкните пустую форму. Задайте Text = Авторизация, ClientSize = 300; 465, StartPosition = CenterScreen, MaximizeBox = False.',
  ], 'Открыта пустая LoginForm в конструкторе, видны Toolbox и Properties.', {links:[lesson('M4',/LoginForm — дизайнер/)]});
  step('Поля и кнопка входа', [
    'Из Toolbox добавьте FlowLayoutPanel с Dock = Fill, FlowDirection = TopDown, WrapContents = False и Padding = 30; 15; 0; 0.',
    'Внутрь панели добавьте Label «Логин», TextBox _tbLogin, Label «Пароль» и TextBox _tbPassword. Задайте ширину полей 220.',
    'Для _tbPassword включите UseSystemPasswordChar. Ниже добавьте Label «Соберите изображение», Panel captchaHost и Button _btnLogin с Text = Войти.',
  ], 'На форме два поля, пароль скрыт, под полями предусмотрено место для пазла.', {links:[lesson('M4',/LoginForm — дизайнер/)]});
  step('Подключение капчи и события Click', [
    'Задайте captchaHost размер 220 × 220. Откройте LoginForm.cs через View Code.',
    'После InitializeComponent добавьте контрол капчи в captchaHost и вызовите LoadImages. Используйте код со следующего слайда.',
    'Сохраните форму. Событие Click подключите после создания UserForm и AdminForm.',
  ], 'Капча загружается из Assets/captcha. В Designer остаётся обычная панель captchaHost.');
  code('Инициализация LoginForm после конструктора', `
private readonly AuthService _auth = new();
private readonly CaptchaPuzzleControl _captcha = new();

public LoginForm()
{
    InitializeComponent();
    _captcha.Dock = DockStyle.Fill;
    captchaHost.Controls.Add(_captcha);
    var path = Path.Combine(AppContext.BaseDirectory, "Assets", "captcha");
    _captcha.LoadImages(path);
}`);
  step('Новая форма UserForm', [
    'В UI/Forms выберите Add → Windows Form → UserForm.cs. Откройте View Designer.',
    'Через Toolbox добавьте два Label с именами lblWelcome и lblRole и кнопку btnLogout. Задайте ей Text = Выход.',
    'Щёлкните кнопку дважды. В созданном обработчике вызовите Close().',
  ], 'В Designer видны приветствие, роль и кнопка «Выход».', {links:[lesson('M4',/UserForm — дизайнер/)]});
  step('Данные пользователя на форме', [
    'Откройте UserForm.cs. Оставьте пустой конструктор с InitializeComponent для Designer.',
    'Добавьте перегрузку UserForm(User user) : this(). В ней заполните lblWelcome.Text и lblRole.Text.',
    'Добавьте using DairyDemo.Auth.Data.Models. Сохраните оба конструктора и соберите проект.',
  ], 'В рабочем окне отображаются логин и роль вошедшего пользователя.', {image:data.screens.mysql['m4-student']});
  step('Новая форма AdminForm и таблица', [
    'В UI/Forms выберите Add → Windows Form → AdminForm.cs. Откройте Designer.',
    'Перетащите DataGridView. Задайте (Name) = _grid, Dock = Fill, ReadOnly = True, MultiSelect = False.',
    'Задайте SelectionMode = FullRowSelect. Через маленькую стрелку справа вверху выберите Edit Columns.',
  ], 'Открыто окно настройки столбцов таблицы.', {links:[lesson('M4',/AdminForm — дизайнер/)]});
  grid('Столбцы DataGridView', ['DataPropertyName', 'Подпись / тип'], [
    ['Id','ID · текст'],['Login','Логин · текст'],['Role','Роль · текст'],
    ['FailedAttempts','Попытки · текст'],['IsLocked','Заблок. · CheckBox'],
  ], {body:'В Edit Columns нажмите Add для каждого столбца. После создания задайте HeaderText и DataPropertyName по таблице.',check:'После привязки коллекции User каждое поле попадает в свой столбец.'});
  step('Панель кнопок администратора', [
    'Из Toolbox добавьте FlowLayoutPanel с Dock = Bottom и высотой 45.',
    'В панель поместите пять Button. Имена и подписи задайте в Properties по таблице.',
    'Откройте Document Outline и проверьте, что кнопки вложены в панель. При необходимости измените порядок Dock через «На передний план» / «На задний план».',
  ], 'Кнопки не закрыты таблицей и помещаются на форме.');
  grid('Кнопки и события администратора', ['Имя и подпись', 'Click'], [
    ['_btnAdd · Добавить','OnAddClick'],
    ['_btnEdit · Изменить','OnEditClick'],
    ['_btnPwd · Сменить пароль','OnChangePwdClick'],
    ['_btnUnlock · Снять блокировку','OnUnlockClick'],
    ['_btnRefresh · Обновить','OnRefreshClick'],
  ], {body:'Выберите кнопку → F4 → Events → Click. Укажите имя обработчика после добавления методов.',check:'У каждой кнопки ровно одна подписка.'});
  step('Логика AdminForm и загрузка строк', [
    'Откройте AdminForm.cs в ZIP. Перенесите поле _repo и методы из LoadUsersAsync до конца класса AdminForm. Поля контролов создаёт Designer.',
    'Сохраните пустой конструктор с InitializeComponent и _grid.AutoGenerateColumns = false. В перегрузке AdminForm(User admin) : this() задайте заголовок.',
    'Создайте OnRefreshClick и обработчик Load формы. В обоих вызовите await LoadUsersAsync().',
  ], 'На открытии формы и по кнопке «Обновить» загружается список User.', {links:sourceLinks});
  step('Диалоги учётных записей', [
    'Откройте исходный AdminForm.cs готового примера. В конце файла найдите UserEditDialog и PasswordDialog.',
    'Перенесите эти два класса в проект с тем же пространством имён. Сохраните сигнатуры, используемые методами AdminForm.',
    'Перенесите строки using из исходного AdminForm.cs. В Build → Build Solution проверьте, что все типы найдены.',
  ], 'Кнопки добавления, редактирования и смены пароля открывают свои диалоги.', {links:[lesson('M4',/Диалоговые окна/),example]});
  step('Обработчик кнопки «Войти»', [
    'В распакованном примере откройте UI/Forms/LoginForm.cs. Скопируйте OnLoginClick в свой LoginForm.cs и перенесите using для Services и UI.Controls.',
    'В начале метода проверьте IsNullOrWhiteSpace для обоих полей. Покажите «Введите логин и пароль» и завершите метод, если поле пустое.',
    'Откройте Designer → _btnLogin → Properties → Events → Click. Выберите OnLoginClick.',
  ], 'У кнопки один обработчик. Пустые поля не меняют счётчик попыток.', {links:sourceLinks});
  step('Точка входа и запуск', [
    'Откройте Program.cs. Добавьте using DairyDemo.Auth.UI.Forms.',
    'После ApplicationConfiguration.Initialize() укажите Application.Run(new LoginForm()).',
    'Проверьте, что XAMPP MySQL запущен. Нажмите F5.',
  ], 'Первой открывается форма авторизации. В ней видны поля, кнопка и четыре фрагмента.', {image:data.screens.mysql.login});
  step('Проверка обязательных полей', [
    'На форме оставьте пустым логин. Нажмите «Войти». Затем повторите проверку с пустым паролем.',
    'В phpMyAdmin откройте users → «Обзор» и сравните failed_attempts до и после.',
  ], 'Оба пустых поля обрабатываются. Счётчик попыток не растёт.');
  step('Вход пользователя', [
    'Введите DemoUser и DkipUser2026!. Щёлкайте по двум фрагментам по очереди, чтобы менять их местами.',
    'Соберите изображение и нажмите «Войти». Закройте сообщение об успешной авторизации.',
  ], 'Открывается рабочее окно пользователя без управления учётными записями.', {image:data.screens.mysql['m4-student']});
  step('Три неверных пароля', [
    'На форме введите DemoUser. Соберите пазл и введите неверный пароль.',
    'Повторите ошибку ещё два раза. Перед каждой попыткой снова соберите пазл.',
    'Соберите пазл, введите верный пароль и нажмите «Войти».',
  ], 'После третьей ошибки is_locked = 1. Вход с верным паролем показывает «Вы заблокированы. Обратитесь к администратору».');
  step('Вход администратора и разблокировка', [
    'Перезапустите приложение. Введите DemoAdmin и DkipAdmin2026!, соберите пазл и войдите.',
    'В таблице выделите строку DemoUser и нажмите «Снять блокировку».',
    'Убедитесь, что в таблице попыток 0 и флажок блокировки снят.',
  ], 'Пользователь снова может войти с верными данными.', {image:data.screens.mysql['m4-admin']});
  step('Три ошибки капчи', [
    'Используйте разблокированную учебную запись DemoUser. Введите верный пароль, но оставьте пазл неверным.',
    'Нажмите «Войти» три раза, каждый раз проверяя, что пазл не собран.',
    'Затем соберите пазл и повторите попытку. После проверки разблокируйте запись из AdminForm.',
  ], 'При повторном входе видна блокировка. После разблокировки корректный вход снова работает.');
  step('Добавление и повторный логин', [
    'На панели администратора нажмите «Добавить». Укажите новый тестовый логин, пароль и роль user. Нажмите «ОК».',
    'Снова нажмите «Добавить». Укажите тот же логин и подтвердите.',
  ], 'В списке одна запись с этим логином. Повторное добавление показывает предупреждение.');
  step('Редактирование и смена пароля', [
    'Выделите тестовую запись → «Изменить». Измените логин и сохраните. Проверьте обновившуюся строку.',
    'Выделите ту же запись → «Сменить пароль». Введите новый пароль и нажмите «ОК».',
    'Запустите форму входа и проверьте новый логин и пароль. Старый пароль должен отклоняться.',
  ], 'Приложение использует сохранённые изменения.');
  step('Сохранение проекта и результатов', [
    'Откройте Build → Build Solution. Проверьте отсутствие ошибок.',
    'Сохраните исходники в папку «Приложение». Запишите результаты проверок и снимите окна обеих ролей.',
  ], 'Проект открывается в Visual Studio и запускается после подготовки базы.', {links:[examplesPage]});
}
