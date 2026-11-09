import { addApplicationSteps } from './deck-winforms-2026.mjs';

const stackName = 'Windows Forms + MySQL / MariaDB';

export function deck2026(data, schema, costSeed) {
  const { official, tasks, criteria, subject } = data;
  const slides = [];
  const chapters = [];
  let chapter = 'intro';
  let number = 0;
  const add = (kind, title, options = {}) => slides.push({ kind, chapter, title, ...options });
  const begin = (id, label) => {
    chapter = id;
    number = 0;
    chapters.push({ id, label, index: slides.length });
  };
  const step = (title, actions, check, options = {}) => {
    add('step', title, { eyebrow: 'Шаг ' + ++number, actions, check, ...options });
  };
  const image = (file, caption) => ({ file: 'materials/source/assets/images/' + file + '.png', caption });
  const kod = (page, label = 'КОД · PDF') => [label, official.pdf + '#page=' + page];
  const lesson = (id, pattern, label = 'Разбор в курсе') => {
    const index = data.stages.mysql.find(item => item.id === id).steps.findIndex(item => pattern.test(item.title));
    if (index < 0) throw new Error(`Не найден шаг презентации: ${id} ${pattern}`);
    return [label, 'index.html?' + new URLSearchParams({mode:'learn',stack:'mysql',module:id,view:'steps',step:index})];
  };
  const doc = (index, pattern) => {
    const file = data.documents.mysql[index].find(item => pattern.test(item.name));
    if (!file) throw new Error('Не найден документ презентации ' + pattern);
    return [file.name,file.path];
  };
  const example = ['Готовый пример Windows Forms · ZIP', data.exampleLaunch.mysql.download];
  const attachments = ['Приложения к КОД · ZIP','downloads/basic-inputs.zip'];
  const examplesPage = ['Примеры · исходники и запуск','index.html?mode=examples&stack=mysql&exampleStack=mysql'];
  const taskStart = (n, output) => {
    const task = tasks[n - 1];
    begin(task.id, `${n}. ${task.title}`);
    add('section', task.title, {eyebrow:`Задание ${n} · ${task.minutes} мин`, body:task.text, note:output,
      links:[kod(task.pages.match(/^\d+/)[0]),...([1,2,4].includes(n)?[attachments]:[])]});
  };
  const grid = (title, columns, rows, options = {}) => add('table', title, { columns, rows, ...options });
  const code = (title, value, links) => {
    let pages = [], current = [], used = 0;
    for (const line of value.trim().split('\n')) {
      const lines = Math.max(1, Math.ceil(line.length / 100));
      if (current.length && used + lines > 15) {
        pages.push(current.join('\n'));
        current = [];
        used = 0;
      }
      current.push(line);
      used += lines;
    }
    if (current.length) pages.push(current.join('\n'));
    pages.forEach((part, i) => add('code',title,{
      eyebrow: pages.length > 1 ? `Код · часть ${i+1} из ${pages.length}` : 'Код', code:part, links,
    }));
  };

  begin('intro', 'Подготовка');
  add('cover', 'Демонстрационный экзамен 2026');
  add('facts', 'Базовый уровень', {
    facts:[[String(tasks.length),'Заданий'],['2 ч 30 мин','На выполнение'],[String(official.points),'Максимум баллов']],
    links:[kod(official.samplePage,'Официальный образец КОД')],
  });
  const contents = slides.length;
  grid('План разбора', ['Раздел', 'Слайд'], []);
  step('Рабочая папка и исходные файлы', [
    'Откройте Проводник. Создайте рабочую папку и подпапки «Исходники», «База», «Приложение» и «Документы».',
    'Скачайте приложения к КОД. Распакуйте М1, М2 и М4 в отдельные подпапки внутри «Исходники».',
    'Откройте в Excel заказ и спецификацию, а в Блокноте — «Заказчики.json».',
  ], 'В исходниках открываются книги Excel, JSON, требования к интерфейсу и четыре фрагмента пазла.', {links:[attachments]});
  step('Инструменты на учебном компьютере', [
    'Откройте XAMPP Control Panel. Проверьте, что доступны модули Apache и MySQL.',
    'Откройте Visual Studio Installer → «Изменить». Проверьте компонент «Разработка классических приложений .NET».',
    'Запустите Visual Studio и убедитесь, что в списке шаблонов есть Windows Forms App для .NET.',
  ], 'Доступны phpMyAdmin, конструктор Windows Forms и редактор диаграмм.', {links:[example]});

  taskStart(1, 'Сохраните рабочую диаграмму и итоговый PDF.');
  const inputs = [
    [/^Заказ покупателя\./, 'Заказ покупателя', 'В Excel откройте «Заказ покупателя.xlsx». Найдите шапку с номером, датой и покупателем, затем табличную часть.', 'Создайте сущности customer_order и customer_order_line. Количество и код продукции внесите в строку.', 'Один заказ связывается с несколькими строками через customer_order_id.'],
    [/^Заказчики\./, 'Контрагенты', 'Откройте «Заказчики.json». Найдите id, name, inn, addres, phone, salesman и buyer.', 'Добавьте сущность counterparty. Назовите поля адреса и признаков address, is_salesman и is_buyer.', 'В заказе хранится ссылка на контрагента. Телефон и ИНН остаются в справочнике.'],
    [/^Спецификация\./, 'Спецификация продукции', 'Откройте «Спецификация.xlsx». Найдите продукцию, объём выпуска и строки с материалами.', 'Добавьте specification и specification_material. В строке материала сохраните норму и единицу измерения.', 'Одна спецификация содержит несколько строк материалов. Материал связан со справочником item.'],
    [/^Цены\./, 'Номенклатура и цены', 'Откройте «Цены.xlsx». Сопоставьте номенклатуру с кодами из спецификации.', 'Создайте item для продукции и материалов. Для цены выделите price с item_id и периодом действия.', 'Несколько цен одной номенклатуры хранятся отдельными записями.'],
    [/^Производство\./, 'Выпуск и расход', 'Откройте «Производство.xlsx». Найдите номер документа, выпуск продукции и расход материалов.', 'Выделите production_order и две табличные части production_product_line и production_material_line.', 'Строки выпуска и расхода связаны с документом производства.'],
    [/^Расчет стоимости/, 'Документ расчёта стоимости', 'Откройте книгу расчёта стоимости. Найдите продукцию, объём расчёта и строки затрат.', 'Добавьте cost_calculation и cost_calculation_line. Отделите реквизиты документа от строк.', 'Строки затрат ссылаются на расчёт и на материал в item.'],
  ];
  for (const [pattern,title,open,act,check] of inputs) step(title,[open,act],check,{links:[doc(0,pattern)]});
  step('Новый файл диаграммы', [
    'В редакторе diagrams.net выберите «Устройство» → «Создать новую диаграмму» → «Пустая диаграмма».',
    'Назовите файл «ER-диаграмма.drawio» и сохраните в рабочую папку.',
    'Внизу слева откройте «Больше фигур». Включите библиотеку Entity Relation.',
  ], 'В редакторе открыто пустое полотно, в панели фигур доступен шаблон таблицы.');
  step('Первая таблица и первичный ключ', [
    'Перетащите таблицу Entity Relation на полотно и назовите её counterparty.',
    'Дважды щёлкните строки и впишите поля из JSON. У id укажите PK.',
    'Добавьте customer_order и customer_order_line. В дочерней таблице отметьте customer_order_id как FK.',
  ], 'В каждой таблице виден PK. Поля будущих связей отмечены FK.');
  for (const t of schema.tables) {
    const outgoing = schema.links.filter(link => link.from === t.id);
    step('ER · ' + t.id, [
      'Выберите фигуру ' + t.id + ' на полотне. Если её ещё нет, перетащите фигуру таблицы и задайте это имя.',
      'Добавьте строки: ' + t.fields.map(f => f.id + (f.pk ? ' (PK)' : f.fk ? ' (FK)' : '')).join(', ') + '.',
      ...(outgoing.length ? ['Проведите связи: ' + outgoing.map(l=>l.field+' → '+l.to+'.'+l.target).join(', ') + '.'] : []),
    ], outgoing.length ? 'У родительской таблицы стоит «1», у дочерней — «многие».' : 'Другие таблицы могут ссылаться на id этой таблицы.');
  }
  step('Проверка 3НФ', [
    'Найдите в customer_order поля, которые описывают заказчика. В заказе оставьте только customer_id.',
    'Проверьте, что цена, количество, норма и единица измерения находятся в таблице, к ключу которой относятся.',
    'Сверьте структуру и связи с интерактивной ER-диаграммой.',
  ], 'У каждой таблицы есть ключ. Данные заказчика не дублируются в заказе.', {links:[lesson('M1',/Сверьте свою ER/)]});
  step('Экспорт схемы в PDF', [
    'В diagrams.net выберите «Файл» → «Экспортировать как» → PDF.',
    'Подберите масштаб по странице. Сохраните «ER-диаграмма.pdf» и откройте его.',
    'Увеличьте PDF и прочитайте ключи, поля и подписи связей.',
  ], 'В PDF помещается вся схема, а исходный .drawio остаётся для правок.', {image:image(12,'Учебная модель в Designer phpMyAdmin для сверки структуры')});

  taskStart(2, 'Создайте базу по схеме, импортируйте шесть контрагентов и сохраните SQL-выгрузку.');
  step('Запуск Apache', ['Откройте XAMPP Control Panel.', 'В строке Apache нажмите Start.'], 'Строка Apache зелёная и показывает PID и порт.', {image:image('xampp-02-apache-start','XAMPP после запуска Apache')});
  step('Запуск MySQL', ['В строке MySQL нажмите Start.', 'Дождитесь, пока рядом появится кнопка Stop.'], 'MySQL запущен и виден его порт.', {image:image('xampp-03-mysql-start','MySQL запущен в XAMPP')});
  step('Открытие phpMyAdmin', ['В строке MySQL нажмите Admin.', 'Если браузер не открылся, введите http://localhost/phpmyadmin/.'], 'В браузере открылась главная страница phpMyAdmin.', {image:image('xampp-04-mysql-admin','Кнопка Admin рядом с MySQL')});
  step('Создание dairy_demo', ['В дереве слева нажмите «Создать».', 'Введите dairy_demo, выберите utf8mb4_general_ci и нажмите «Создать».'], 'База dairy_demo появилась в дереве.', {image:image(6,'Создание базы в phpMyAdmin')});
  step('Форма создания таблицы', [
    'Выберите dairy_demo → «Структура». Введите имя таблицы и число столбцов со следующего слайда.',
    'Нажмите «Создать». Для каждого поля внесите имя, тип, длину и значение по умолчанию.',
    'Если указано NULL, поставьте отметку в колонке Null. Для PK выберите индекс PRIMARY, для A_I включите автоинкремент.',
  ], 'Для хранения связей выберите InnoDB. Сначала создайте все таблицы, затем добавьте FK.', {image:image(7,'Форма создания таблицы в phpMyAdmin')});
  for (const t of schema.tables) {
    const fields = t.fields.map(f => [
      f.id, [f.type, f.nullable?'NULL':'NOT NULL',f.pk?'PK':'',f.autoIncrement?'A_I':'',f.unique?'UNIQUE':'',f.defaultValue!==undefined?'DEFAULT '+f.defaultValue:''].filter(Boolean).join(' · '),
    ]);
    grid('Таблица ' + t.id, ['Поле', 'Тип и настройки'], fields, {
      eyebrow:'Шаг ' + ++number,
      body:`В dairy_demo откройте «Структура» → «Создать таблицу». Введите ${t.id}, столбцов — ${fields.length}.`,
      check:'Нажмите «Сохранить». Откройте «Структура» и сверьте поля и ключи с таблицей на слайде.',
    });
  }
  step('Уникальность пары полей', [
    'Откройте specification_material → «Структура». Выделите specification_id и material_item_id.',
    'Создайте один составной индекс UNIQUE для двух полей. Назовите его uq_spec_material.',
  ], 'В списке индексов видна одна уникальная пара, допускающая разные материалы в одной спецификации.');
  step('Открытие Relation view', ['Выберите дочернюю таблицу и нажмите «Структура» → Relation view.', 'В разделе ограничений внешних ключей выберите поле, родительскую таблицу и её ключ.'], 'В открытой форме есть настройки ограничений InnoDB.', {image:image(72,'Переход к настройкам связей в phpMyAdmin')});
  for (const t of schema.tables) {
    const links = schema.links.filter(l=>l.from===t.id);
    if (!links.length) continue;
    step('Внешние ключи ' + t.id, [
      'Откройте ' + t.id + ' → «Структура» → Relation view.',
      ...links.map(l=>`Укажите ${l.field} → dairy_demo.${l.to}.${l.target}. ON DELETE: ${l.onDelete}. ON UPDATE: ${l.onUpdate}.`),
      'Нажмите «Сохранить». Снова откройте Relation view.',
    ], 'Все указанные ограничения видны в списке.');
  }
  step('Открытие JSON в Excel', [
    'В Excel выберите «Данные» → «Получить данные» → «Из файла» → «Из JSON».',
    'Выберите «Заказчики.json». В Power Query преобразуйте список в таблицу и разверните записи.',
  ], 'В таблице шесть строк. Видны семь исходных полей.', {links:[doc(1,/\.json$/)]});
  step('Подготовка CSV для counterparty', [
    'Переименуйте addres → address, salesman → is_salesman и buyer → is_buyer.',
    'В двух колонках признаков замените true и false на 1 и 0. Для ИНН и телефона установите тип «Текст».',
    'Нажмите «Закрыть и загрузить». Сохраните лист как CSV UTF-8. Сверьте порядок полей с таблицей counterparty.',
  ], 'Проверьте фактический разделитель и отсутствие пустых строк. В учебном CSV используется запятая.', {links:[doc(1,/\.csv$/)]});
  step('Импорт файла в phpMyAdmin', [
    'В дереве откройте dairy_demo → counterparty → «Импорт». Нажмите «Выбрать файл» и укажите CSV.',
    'Выберите формат CSV и кодировку UTF-8. Укажите разделитель файла, кавычку " и строку заголовков.',
    'Нажмите «Вперёд» / Go. После сообщения об успехе откройте «Обзор».',
  ], 'В counterparty отображаются шесть записей.', {image:image(84,'Параметры импорта CSV')});
  step('Проверка заказчиков', [
    'На вкладке «Обзор» найдите id = 3. Сверьте ИНН 4140784214 и телефон +79882584546.',
    'Найдите id = 1. Проверьте отсутствие ИНН. Числовой id = 1 соответствует коду 000000001 из JSON.',
    'Откройте Designer и сопоставьте линии связей с PDF из первого задания.',
  ], 'Сохранились реквизиты, шесть строк и ограничения.', {image:image(12,'Связи в Designer')});
  step('Проверка внешнего ключа', [
    'В пустой таблице customer_order_line откройте «Вставить». Оставьте id пустым, введите customer_order_id = 999999 и product_item_id = 999999.',
    'Введите qty = 1 и unit = шт. Нажмите «Вперёд».',
  ], 'Вставка отклонена с ошибкой внешнего ключа. В «Обзоре» нет строки с вымышленным заказом.');
  step('Экспорт базы', ['Выберите dairy_demo → «Экспорт».', 'Выберите формат SQL и нажмите «Экспорт». Сохраните файл в папку «База».'], 'В SQL есть структура таблиц и данные counterparty.');

  taskStart(3, 'Сохраните запрос и сверьте итог с ручным расчётом.');
  step('Копия структуры для контрольного расчёта', [
    'В phpMyAdmin выберите dairy_demo → «Операции». Найдите «Копировать базу данных в».',
    'Введите dairy_cost_check и выберите «Только структура». Нажмите «Вперёд».',
    'В дереве выберите dairy_cost_check. Проверьте, что item, counterparty и customer_order пусты.',
  ], 'Контрольные строки загружаются в отдельную базу, а база М2 сохраняется.');
  step('Загрузка контрольных строк', [
    'Выберите dairy_cost_check → «Импорт» → «Выбрать файл».',
    'Укажите «Данные для расчёта.sql». Выберите формат SQL и нажмите «Вперёд».',
    'Откройте customer_order → «Обзор». Найдите ЗП-0001, ЗП-0002 и ЗП-0003.',
  ], 'У ЗП-0001 две позиции. Для каждого материала есть цена и норма расхода.', {links:[['Данные для расчёта · SQL','materials/teacher-2026/cost-inputs.sql']]});
  step('Проверка норм и цен', [
    'В item → «Обзор» найдите MAT-001, MAT-002 и MAT-003. В price найдите их цены 30, 50 и 200.',
    'Откройте specification_material. Для йогурта найдите 0,200 л молока и 0,050 кг сахара.',
    'В customer_order_line найдите количество йогурта и какао в ЗП-0001.',
  ], 'В ЗП-0001 — 10 единиц йогурта и 5 единиц какао.');
  grid('Ручной расчёт ЗП-0001', ['Позиция', 'Стоимость'], [
    ['Йогурт · (0,200 × 30 + 0,050 × 50) × 10','85,00 ₽'],
    ['Напиток какао · (0,250 × 30 + 0,030 × 50 + 0,020 × 200) × 5','65,00 ₽'],
    ['Полная стоимость заказа','150,00 ₽'],
  ]);
  step('Сборка запроса', [
    'В редакторе SQL соедините specification_material с price по material_item_id. Выберите одну действующую цену на материал.',
    'Сложите qty × price по спецификации и разделите на output_qty. Соедините результат с позициями заказов.',
    'Для каждого заказа сложите количество × стоимость единицы. Примените ROUND к сумме.',
  ], 'Запрос возвращает одну строку на заказ.', {links:[lesson('M3',/Итог по заказу/)]});
  const costLink = ['Итоговый запрос · SQL','materials/teacher-2026/cost-total.sql'];
  code('Итоговый запрос по заказам',costSeed.query,[costLink]);
  step('Запуск и сверка результата', [
    'Выберите dairy_cost_check → вкладка SQL. Вставьте итоговый запрос целиком и нажмите «Вперёд».',
    'Сравните строки с ручным расчётом. Для ЗП-0001 ожидается 150,00, для ЗП-0002 — 260,00, для ЗП-0003 — 425,00.',
    'Сохраните запрос в папку «База». Если строк нет, проверьте выбранную базу, цены и спецификации.',
  ], 'На экране три заказа. Для ЗП-0001 итог совпадает с ручным расчётом.', {links:[costLink]});

  taskStart(4, 'Соберите Windows Forms, проверьте вход, блокировку и действия администратора.');
  addApplicationSteps({ step, grid, code, image, lesson, doc, example, examplesPage, data });

  taskStart(5, 'Подготовьте документацию к созданной системе и опишите методы с параметрами.');
  step('Создание документов в Word', [
    'Откройте Word → «Файл» → «Создать» → «Новый документ».',
    'Сохраните его через «Файл» → «Сохранить как» в папку «Документы» под именем «Пояснительная записка.docx».',
    'Создайте таким же способом «Техническое задание.docx» и «Руководство пользователя.docx».',
  ], 'В папке три редактируемых файла. Это учебный способ организовать документацию.', {links:[lesson('M5',/Функциональное назначение/)]});
  step('Назначение и архитектура', [
    'В пояснительной записке добавьте заголовки «Назначение», «Роли», «Архитектура» и «Методы».',
    'Опишите путь данных: LoginForm → AuthService → UserRepository → таблица users.',
    'Добавьте роль пользователя, роль администратора, назначение капчи и правило блокировки.',
  ], 'По описанию видно, где проверяются данные, кто меняет записи и где они хранятся.');
  step('Таблица методов', [
    'В Word выберите «Вставка» → «Таблица» и добавьте столбцы «Метод», «Параметры», «Результат» и «Что делает».',
    'Откройте Services/AuthService.cs и Data/Repositories/UserRepository.cs в Visual Studio.',
    'Перенесите в таблицу имена методов и параметры из своего кода. Для каждого укажите, какие данные меняются.',
  ], 'Имена и типы параметров совпадают с сигнатурами исходников.', {links:[lesson('M5',/Описание используемых классов и методов/)]});
  grid('Методы авторизации', ['Метод и параметры', 'Результат или действие'], [
    ['LoginAsync(string login, string password, bool captchaOk)','ok, message, user'],
    ['GetByLoginAsync(string login)','User или null'],
    ['IncrementFailedAttemptsAndLockIfNeededAsync(long userId)','Ошибка +1, блокировка на третьей'],
    ['ResetFailedAttemptsAsync(long userId)','Сбрасывает счётчик'],
  ]);
  grid('Методы администратора', ['Метод и параметры', 'Действие'], [
    ['ExistsLoginAsync(string login, long excludeId = 0)','Проверяет дубликат логина'],
    ['AddUserAsync(string login, string passwordHash, string role)','Добавляет запись'],
    ['UpdateUserAsync(long id, string login, string role)','Меняет логин и роль'],
    ['UpdatePasswordAsync(long id, string passwordHash)','Обновляет хеш пароля'],
    ['UnlockAsync(long userId)','Снимает блокировку'],
  ]);
  step('Техническое задание и критерии приёмки', [
    'Откройте «Техническое задание.docx». Внесите назначение, среду, роли и требования к работе приложения.',
    'В разделе приёмки перечислите пустые поля, неверный пароль, неверный пазл, три ошибки, вход обеих ролей, повторный логин и разблокировку.',
    'Для каждой проверки запишите действие и ожидаемое сообщение или изменение.',
  ], 'У каждого требования есть способ проверки.', {links:[lesson('M5',/Порядок контроля и приёмки/)]});
  step('Руководство по работе с формами', [
    'Откройте «Руководство пользователя.docx». Запишите, как запустить базу и приложение.',
    'Опишите по порядку ввод логина, сборку пазла, вход, выход и действия при блокировке.',
    'В разделе администратора покажите выбор записи, добавление, редактирование и снятие блокировки. Вставьте свои снимки через «Вставка» → «Рисунки».',
  ], 'Подписи кнопок и сообщения в руководстве совпадают с запущенным приложением.', {links:[lesson('M5',/Работа с программой/)]});
  step('Сверка и сохранение комплекта', [
    'Откройте приложение и повторите описанные в руководстве действия.',
    'Сверьте методы в пояснительной записке с исходниками и заполните результаты проверок.',
    'Сохраните документы. Проверьте, что рядом лежат PDF схемы, SQL-выгрузка, итоговый запрос и исходники Windows Forms.',
  ], 'Все пять результатов открываются из рабочей папки.');

  begin('criteria', 'Критерии оценки');
  grid('Критерии базового уровня', ['Критерий', 'Баллы'], [...criteria.map(([label,points])=>[label,String(points)]),['Итого',String(official.points)]], {links:[kod(official.criteriaPage)]});
  slides[contents].rows = chapters.slice(1).map(({label,index})=>[label,String(index+1)]);
  return {stackName,code:official.code,duration:official.minutes,points:official.points,year:official.year,subject,slides,chapters};
}
