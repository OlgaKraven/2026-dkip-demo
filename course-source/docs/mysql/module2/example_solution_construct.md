# Модуль 2. Пример решения — через конструктор phpMyAdmin

**Цель:** создать БД и таблицы по ER через графический интерфейс phpMyAdmin (без написания SQL вручную), затем импортировать `Заказчики.json`.

---

## 1. Запуск XAMPP и открытие phpMyAdmin

1. Запустите **XAMPP Control Panel**.

   ![Открытие XAMPP Control Panel](../../assets/images/xampp-01-open.png)

   /// caption
   Рисунок 1 – Открытие XAMPP Control Panel
   ///

2. Нажмите **Start** в строке **Apache** → дождитесь статуса **Running**.

   ![Запуск Apache](../../assets/images/xampp-02-apache-start.png)

   /// caption
   Рисунок 2 – Запуск Apache
   ///

3. Нажмите **Start** в строке **MySQL** → дождитесь статуса **Running**.

   ![Запуск MySQL](../../assets/images/xampp-03-mysql-start.png)

   /// caption
   Рисунок 3 – Запуск MySQL
   ///

4. Откройте phpMyAdmin:

   **Вариант A:** кнопка **Admin** в строке MySQL.

   ![Открыть phpMyAdmin через Admin](../../assets/images/xampp-04-mysql-admin.png)

   /// caption
   Рисунок 4 – Открытие через кнопку Admin
   ///

   **Вариант B:** в браузере `http://localhost/phpmyadmin/`

   ![Открыть phpMyAdmin через браузер](../../assets/images/xampp-05-phpmyadmin-url.png)

   /// caption
   Рисунок 5 – Открытие через браузер
   ///

5. Убедитесь, что phpMyAdmin открылся без ошибок.

   ![Главная страница phpMyAdmin](../../assets/images/phpmyadmin-01-home.png)

   /// caption
   Рисунок 6 – Главная страница phpMyAdmin
   ///

---

## 2. Создание базы данных

1. Вкладка **Databases** → в поле **Create database** введите `dairy_demo`.
2. Collation: `utf8mb4_unicode_ci`.
3. Нажмите **Create**.

   ![Создание базы данных](../../assets/images/6.png)

   /// caption
   Рисунок 7 – Создание базы данных `dairy_demo`
   ///

4. БД `dairy_demo` появится в левой панели.

   ![БД в дереве](../../assets/images/8.png)

   /// caption
   Рисунок 8 – База данных в дереве phpMyAdmin
   ///

---

## 3. Создание таблиц через конструктор

> Для каждой таблицы: выберите `dairy_demo` → вкладка **Structure** → **Create table**.

---

### 3.1. COUNTERPARTY

Имя таблицы: `counterparty`, количество столбцов: **7**.

| Field | Type | Length | Null | Default | Index | Extra |
|-------|------|--------|------|---------|-------|-------|
| id | BIGINT | | NO | | PRIMARY | AUTO_INCREMENT |
| name | VARCHAR | 255 | NO | | | |
| inn | VARCHAR | 32 | YES | NULL | | |
| address | VARCHAR | 255 | YES | NULL | | |
| phone | VARCHAR | 64 | YES | NULL | | |
| is_salesman | TINYINT | 1 | NO | 0 | | |
| is_buyer | TINYINT | 1 | NO | 0 | | |

- Engine: **InnoDB**, Collation: `utf8mb4_unicode_ci`

   ![Создание таблицы](../../assets/images/7.png)

   /// caption
   Рисунок 9 – Задание имени и структуры таблицы
   ///

После сохранения откройте вкладку **Структура**. У `id` должны быть первичный ключ и `AUTO_INCREMENT`. Сверьте типы `inn`, `address` и `phone` с таблицей выше. Для всех трёх нужен `VARCHAR`.

---

### 3.2. ITEM

Имя: `item`, столбцов: **5**.

| Field | Type | Length | Null | Default | Index | Extra |
|-------|------|--------|------|---------|-------|-------|
| id | BIGINT | | NO | | PRIMARY | AUTO_INCREMENT |
| code | VARCHAR | 64 | YES | NULL | UNIQUE | |
| name | VARCHAR | 255 | NO | | | |
| item_type | ENUM('product','material') | | NO | | | |
| unit_default | VARCHAR | 32 | YES | NULL | | |

   ![ITEM](../../assets/images/61.png)

   /// caption
   Рисунок 12 – Таблица `item`
   ///

---

### 3.3. PRICE

Имя: `price`, столбцов: **5**.

| Field | Type | Length | Null | Default |
|-------|------|--------|------|---------|
| id | BIGINT | | NO | AUTO_INCREMENT, PK |
| item_id | BIGINT | | NO | |
| price | DECIMAL | 12,2 | NO | |
| effective_from | DATE | | YES | NULL |
| effective_to | DATE | | YES | NULL |

FK: `item_id` → `item(id)` ON UPDATE CASCADE ON DELETE RESTRICT

   ![PRICE](../../assets/images/62.png)

   /// caption
   Рисунок 13 – Таблица `price`
   ///

---

### 3.4. SPECIFICATION

| Field | Type | Null | Default |
|-------|------|------|---------|
| id | BIGINT AUTO_INCREMENT PK | NO | |
| name | VARCHAR(255) | NO | |
| product_item_id | BIGINT FK→item | NO | |
| output_qty | DECIMAL(12,3) | NO | 1.000 |
| output_unit | VARCHAR(32) | YES | NULL |
| manufacturer_id | BIGINT FK→counterparty | YES | NULL |

   ![SPECIFICATION](../../assets/images/63.png)

   /// caption
   Рисунок 14 – Таблица `specification`
   ///

### 3.5. SPECIFICATION_MATERIAL

| Field | Type | Null |
|-------|------|------|
| id | BIGINT AUTO_INCREMENT PK | NO |
| specification_id | BIGINT FK→specification | NO |
| material_item_id | BIGINT FK→item | NO |
| qty | DECIMAL(12,3) | NO |
| unit | VARCHAR(32) | YES |

Уникальное ограничение: `(specification_id, material_item_id)`

   ![SPECIFICATION_MATERIAL](../../assets/images/64.png)

   /// caption
   Рисунок 15 – Таблица `specification_material`
   ///

---

### 3.6. PRODUCTION_ORDER, PRODUCTION_PRODUCT_LINE, PRODUCTION_MATERIAL_LINE

 
| Имя | Тип | Null |
|---|---|---|
| id | BIGINT(20) | ☐ |
| doc_no | VARCHAR(64) | ☐ |
| doc_date | DATE | ☑ |
| manufacturer_id | BIGINT(20) | ☑ |
| note | TEXT | ☑ |


   ![PRODUCTION_ORDER](../../assets/images/65.png)

   /// caption
   Рисунок 16 – Таблица `production_order`
   ///

| Имя | Тип | Null |
|---|---|---|
| id | BIGINT(20) | ☐ |
| production_order_id | BIGINT(20) | ☐ |
| product_item_id | BIGINT(20) | ☐ |
| qty | DECIMAL(12,3) | ☐ |
| unit | VARCHAR(32) | ☑ |


   ![PRODUCTION_PRODUCT_LINE](../../assets/images/66.png)

   /// caption
   Рисунок 17 – Таблица `production_product_line`
   ///
| Имя | Тип | Null |
|---|---|---|
| id | BIGINT(20) | ☐ |
| production_order_id | BIGINT(20) | ☐ |
| material_item_id | BIGINT(20) | ☐ |
| qty | DECIMAL(12,3) | ☐ |
| unit | VARCHAR(32) | ☑ |

   ![PRODUCTION_MATERIAL_LINE](../../assets/images/67.png)

   /// caption
   Рисунок 18 – Таблица `production_material_line`
   ///

---

### 3.7. CUSTOMER_ORDER и CUSTOMER_ORDER_LINE


| Имя | Тип | Null |
|---|---|---|
| id | BIGINT(20) | ☐ |
| doc_no | VARCHAR(64) | ☐ |
| doc_date | DATE | ☑ |
| executor_id | BIGINT(20) | ☑ |
| customer_id | BIGINT(20) | ☑ |
| total_amount | DECIMAL(12,2) | ☑ |

   ![CUSTOMER_ORDER](../../assets/images/68.png)

   /// caption
   Рисунок 19 – Таблица `customer_order`
   ///

**customer_order_line** (Image 5)

| Имя | Тип | Null |
|---|---|---|
| id | BIGINT(20) | ☐ |
| customer_order_id | BIGINT(20) | ☐ |
| product_item_id | BIGINT(20) | ☐ |
| qty | DECIMAL(12,3) | ☐ |
| unit | VARCHAR(32) | ☑ |
| unit_price | DECIMAL(12,2) | ☑ |
| line_amount | DECIMAL(12,2) | ☑ |

   ![CUSTOMER_ORDER_LINE](../../assets/images/69.png)

   /// caption
   Рисунок 20 – Таблица `customer_order_line`
   ///

---

### 3.8. COST_CALCULATION и COST_CALCULATION_LINE


| Имя | Тип | Null |
|---|---|---|
| id | BIGINT(20) | ☐ |
| calc_date | DATE | ☑ |
| product_item_id | BIGINT(20) | ☐ |
| product_qty | DECIMAL(12,3) | ☐ |
| total_cost | DECIMAL(12,2) | ☑ |

   ![COST_CALCULATION](../../assets/images/70.png)

   /// caption
   Рисунок 21 – Таблица `cost_calculation`
   ///


| Имя | Тип | Null |
|---|---|---|
| id | BIGINT(20) | ☐ |
| cost_calculation_id | BIGINT(20) | ☐ |
| material_item_id | BIGINT(20) | ☐ |
| qty | DECIMAL(12,3) | ☐ |
| unit | VARCHAR(32) | ☑ |
| unit_cost | DECIMAL(12,2) | ☑ |
| line_cost | DECIMAL(12,2) | ☑ |

   ![COST_CALCULATION_LINE](../../assets/images/71.png)

   /// caption
   Рисунок 22 – Таблица `cost_calculation_line`
   ///

---

## 4. Настройка внешних ключей (Relation view)

Для каждой таблицы: вкладка **Structure** → внизу кнопка **Relation view**.

   ![Relation view](../../assets/images/72.png)

   /// caption
   Рисунок 23 – Переход в Relation view
   ///

### FK: price → item

   ![FK price-item](../../assets/images/73.png)

   /// caption
   Рисунок 24 – `price.item_id` → `item(id)` CASCADE/RESTRICT
   ///

### FK: specification

   ![FK specification](../../assets/images/74.png)

   /// caption
   Рисунок 25 – Связи таблицы `specification`
   ///

### FK: specification_material

   ![FK specification_material](../../assets/images/75.png)

   /// caption
   Рисунок 26 – Связи таблицы `specification_material`
   ///

### FK: production_order

   ![FK production_order](../../assets/images/76.png)

   /// caption
   Рисунок 27 – Связь `production_order` → `counterparty`
   ///

### FK: production_product_line

   ![FK production_product_line](../../assets/images/77.png)

   /// caption
   Рисунок 28 – Связи `production_product_line`
   ///

### FK: production_material_line

   ![FK production_material_line](../../assets/images/78.png)

   /// caption
   Рисунок 29 – Связи `production_material_line`
   ///

### FK: customer_order

   ![FK customer_order](../../assets/images/79.png)

   /// caption
   Рисунок 30 – Связи `customer_order`
   ///

### FK: customer_order_line

   ![FK customer_order_line](../../assets/images/80.png)

   /// caption
   Рисунок 31 – Связи `customer_order_line`
   ///

### FK: cost_calculation

   ![FK cost_calculation](../../assets/images/81.png)

   /// caption
   Рисунок 32 – Связь `cost_calculation` → `item`
   ///

### FK: cost_calculation_line

   ![FK cost_calculation_line](../../assets/images/82.png)

   /// caption
   Рисунок 33 – Связи `cost_calculation_line`
   ///

---

## 5. Импорт Заказчики.json через конструктор

> phpMyAdmin **не поддерживает прямой JSON-импорт** в структуру таблицы.
> Используйте подход: **JSON → CSV → Import**.

### Шаг 1. Подготовьте CSV

[Скачайте готовый CSV из исходного JSON](../files/customers.csv), чтобы сверить свои данные.

1. В Excel выберите **Данные → Получить данные → Из файла → Из JSON** и откройте `Заказчики.json`.
2. В Power Query преобразуйте список в таблицу и разверните поля.
3. Сохраните порядок столбцов `id, name, inn, address, phone, is_salesman, is_buyer`. Переименуйте `addres`, `salesman` и `buyer`.
4. Установите для ИНН и телефона тип **Текст**, а в двух последних столбцах используйте `1` и `0`. Идентификатор в MySQL хранится числом. Например, `000000003` соответствует записи `3`.
5. Сохраните CSV в UTF-8. В параметрах импорта укажите фактический разделитель файла. В готовом файле разделитель — запятая.

### Шаг 2: Import CSV через phpMyAdmin

1. `dairy_demo` → таблица `counterparty` → вкладка **Import**.

   ![Import tab](../../assets/images/83.png)

   /// caption
   Рисунок 34 – Вкладка Import в phpMyAdmin
   ///

2. **Choose file** → выберите `Заказчики.csv`.
3. Format: **CSV**. Отметьте: *The first line of the file contains the table column names*.
4. Character set: **utf-8**, разделитель: `,`.

   ![Import settings](../../assets/images/84.png)

   /// caption
   Рисунок 35 – Настройки CSV-импорта
   ///

5. Нажмите **Go**. На вкладке **Browse** должно быть шесть строк. Сверьте у записи `id = 3` адрес, ИНН `4140784214` и телефон `+79882584546`. У записи `id = 1` ИНН отсутствует.

---

## 6. Проверка структуры БД

После создания всех таблиц и связей откройте вкладку **Designer** для визуальной проверки ER.

   ![ER в Designer](../../assets/images/12.png)

   /// caption
   Рисунок 36 – ER-диаграмма в Designer phpMyAdmin
   ///

   ![Выгрузка в PDF](../../assets/images/85.png)

   /// caption
   Рисунок 37 – Экспорт структуры для подтверждения
   ///

---

## 7. Скачать готовую базу данных

[ Скачать dairy_demo.sql](../files/dairy_demo.sql){ .md-button }
