export function addErSteps({ step, image, lesson, schema }) {
  const learn = (pattern, label) => lesson('M1', pattern, label);
  step('Новый проект в ERD Tool', [
    'В pgAdmin раскройте сервер и выберите служебную базу postgres. Откройте Tools → ERD Tool.',
    'Нажмите Add Table. Введите counterparty и оставьте public в качестве метки схемы на холсте.',
    'На вкладке Columns добавьте семь полей. У id выберите тип text и включите Primary key?.',
  ], 'Начальные нули сохраняются. У name, is_salesman и is_buyer включён Not NULL?.', {
    links: [learn(/Создайте таблицы на холсте/, 'Создание таблицы на холсте')],
    image: image('preparation/postgres-m1-table', 'Столбцы counterparty в ERD Tool'),
  });
  for (const table of schema.tables) {
    const fields = table.fields.map(field => field.id + (field.pk ? ' (PK)' : field.fk ? ' (FK)' : ''));
    const outgoing = schema.links.filter(link => link.from === table.id);
    step('ER · ' + table.id, [
      'Через Add Table создайте ' + table.id + '. Добавьте столбцы ' + fields.join(', ') + '.',
      'Выберите типы из карточки таблицы. У id включите Primary key?. Нажмите Save.',
      ...(outgoing.length ? ['Через One-to-Many Relation добавьте ' + outgoing.map(link =>
        link.field + ' → ' + link.to + '.' + link.target).join(', ') + '.'] : []),
    ], 'Сверьте таблицу и её ссылки со списком сущностей и таблицей связей.', {
      links: [learn(/Состав ER-модели/, 'Список сущностей'), learn(/Таблица связей/, 'Таблица связей')],
    });
  }
  step('Связи и нормализация', [
    'Выделите дочернюю таблицу. Нажмите One-to-Many Relation и укажите локальное поле и ключ родительской таблицы.',
    'Для четырёх необязательных ссылок на контрагента оставьте Not NULL? выключенным.',
    'Сверьте 12 таблиц, 68 полей и 17 связей. Проверьте, что реквизиты контрагента хранятся в справочнике.',
  ], 'Одна номенклатурная позиция может иметь несколько цен. В цене указан один обязательный item_id.', {
    links: [learn(/Добавьте 17 связей/, 'Поля диалога связи'), learn(/Принципы нормализации/, 'Проверка 3НФ')],
    image: image('preparation/postgres-m1-relation', 'Связь price.item_id с item.id'),
  });
  step('Сохранение диаграммы и PDF', [
    'Выберите Auto Align и Zoom to Fit. Сгруппируйте таблицы документов рядом со строками и освободите место для линий.',
    'Через Save Project сохраните файл .pgerd. Через Download image выгрузите PNG.',
    'Вставьте PNG в альбомную страницу Word. Нажмите F12, выберите PDF, сохраните и откройте файл.',
  ], 'На одной странице видны все таблицы и связи. Рабочий файл .pgerd сохранён для изменений.', {
    links: [learn(/Сохраните диаграмму и PDF/, 'Экспорт и сохранение')],
    image: image('preparation/postgres-m1-er', 'Схема после размещения таблиц'),
  });
}

export function addDatabaseSteps({ step, image, lesson, doc, schema }) {
  const learn = (pattern, label) => lesson('M2', pattern, label);
  step('База dairy_demo и схема app', [
    'В pgAdmin щёлкните правой кнопкой по Databases → Create → Database… и введите dairy_demo.',
    'Сверните служебную базу postgres. В новой базе откройте Schemas → Create → Schema… и введите app.',
  ], 'Ветка Tables находится внутри dairy_demo → Schemas → app.', {
    links: [learn(/Создайте базу dairy_demo/, 'Создание базы'), learn(/Создайте схему app/, 'Создание схемы')],
    image: image('preparation/postgres-m2-schema', 'Схема app в новой базе'),
  });
  step('Конструктор таблицы', [
    'В app щёлкните по Tables → Create → Table…. На вкладке General введите имя.',
    'На вкладке Columns нажмите + для каждого поля. Укажите тип, длину или точность, значение по умолчанию и флаги.',
    'Сначала создайте все таблицы. Затем откройте их Properties → Constraints для внешних ключей, Check и Unique.',
  ], 'У автоинкрементного ключа тип bigserial. Id контрагента типа text.', {
    links: [learn(/Освойте конструктор/, 'Параметры столбцов')],
    image: image('preparation/postgres-m2-counterparty', 'Столбцы counterparty в pgAdmin'),
  });
  for (const table of schema.tables) {
    const outgoing = schema.links.filter(link => link.from === table.id);
    step('Таблица ' + table.id, [
      'В app создайте ' + table.id + '. Добавьте столбцы ' + table.fields.map(field => field.id).join(', ') + '.',
      'Типы, длины, значения по умолчанию и флаги перенесите из карточки этой таблицы.',
      ...(outgoing.length ? ['После создания всех таблиц настройте в Constraints ссылки из карточки.'] : []),
    ], 'После сохранения сверьте столбцы и ограничения в Properties.', {
      links: [learn(new RegExp('^Создайте таблицу ' + table.id + '$'), 'Поля и ограничения ' + table.id)],
    });
  }
  step('Foreign Key, Check и Unique', [
    'В Properties откройте Constraints → Foreign Key. На вкладке Columns укажите локальный столбец, схему app, родительскую таблицу и её id.',
    'На Action выберите правила удаления и изменения из карточки. Сохраните диалог ограничения, затем свойства таблицы.',
    'В Check добавьте условие из карточки. В Unique добавьте имя и столбцы, например пару specification_id и material_item_id.',
  ], 'В базе есть 17 внешних ключей, 16 ограничений Check и два дополнительных Unique.', {
    links: [learn(/Добавьте связи и ограничения/, 'Вкладки и поля ограничения')],
    image: image('preparation/postgres-m2-fk-columns', 'Связь в свойствах таблицы'),
  });
  step('Excel и CSV', [
    'В Excel выберите Данные → Получить данные → Из файла → Из JSON. В Power Query нажмите «В таблицу» и раскройте Column1.',
    'Отключите префикс, загрузите лист, переименуйте столбцы по карточке. Замените логические значения на 1 и 0.',
    'Нажмите F12 и выберите CSV UTF-8. В Блокноте проверьте семь заголовков, шесть строк и фактический разделитель.',
  ], 'Первая запись начинается с 000000001. Заголовок, ведущие нули и знаки + в телефонах сохранились.', {
    links: [doc(1, /\.json$/), learn(/Преобразуйте.*Excel/, 'Преобразование JSON')],
    image: image('preparation/m2-power-query-columns', 'Исходные поля после раскрытия в Power Query'),
  });
  step('Импорт в pgAdmin', [
    'Щёлкните по counterparty правой кнопкой → Import/Export Data…. Выберите Import, свой файл, csv и UTF8.',
    'В Options включите Header. Укажите фактический разделитель. Выберите двойную кавычку в Quote и Escape.',
    'Проверьте семь столбцов. Нажмите OK. После Process completed откройте View/Edit Data → All Rows.',
  ], 'У counterparty шесть записей. Отсутствующий ИНН отображается как NULL.', {
    links: [learn(/Импортируйте контрагентов/, 'Импорт и результат')],
    image: image('preparation/postgres-m2-import-options', 'Параметры импорта в pgAdmin'),
  });
  step('Выгрузка базы и проверка восстановления', [
    'В dairy_demo откройте Backup…. Выберите формат Plain и файл dairy_demo.sql.',
    'В Data Options оставьте Only data и Only schemas выключенными. В Do not save включите Owner и Privileges.',
    'Создайте пустую проверочную базу. В Restore… выберите Plain и сохранённый файл. После восстановления откройте app.',
  ], 'В проверочной базе видны все 12 таблиц и шесть строк counterparty. Продолжайте в исходной dairy_demo.', {
    links: [learn(/Выгрузите и восстановите/, 'Выгрузка и восстановление')],
    image: image('preparation/postgres-m2-backup-options', 'Параметры выгрузки структуры и данных'),
  });
}
