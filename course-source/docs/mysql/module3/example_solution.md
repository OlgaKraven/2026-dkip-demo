# Модуль 3. Пример решения — расчёт полной стоимости заказа

Ниже представлен пример решения задания Модуля 3.

---

## Подготовка тестовых данных

Для контрольного примера создайте отдельную пустую базу. Выполните в ней команды создания таблиц из [модуля 2](../module2/example_solution.md), затем выполните блоки INSERT ниже один раз. В готовом дампе М2 уже есть другой набор заказов `CO-2026-…`, поэтому на нём вы увидите другие суммы.

### Материалы (item_type = 'material')

```sql
INSERT INTO item (code, name, item_type, unit_default) VALUES
('MAT-001', 'Молоко',  'material', 'л'),
('MAT-002', 'Сахар',   'material', 'кг'),
('MAT-003', 'Какао',   'material', 'кг');
```

### Продукты (item_type = 'product')

```sql
INSERT INTO item (code, name, item_type, unit_default) VALUES
('PRD-001', 'Йогурт клубничный', 'product', 'шт'),
('PRD-002', 'Напиток какао',     'product', 'шт');
```

### Цены на материалы

```sql
-- Молоко: 30 руб/л
INSERT INTO price (item_id, price, effective_from) VALUES
((SELECT id FROM item WHERE code = 'MAT-001'), 30.00, '2026-01-01');

-- Сахар: 50 руб/кг
INSERT INTO price (item_id, price, effective_from) VALUES
((SELECT id FROM item WHERE code = 'MAT-002'), 50.00, '2026-01-01');

-- Какао: 200 руб/кг
INSERT INTO price (item_id, price, effective_from) VALUES
((SELECT id FROM item WHERE code = 'MAT-003'), 200.00, '2026-01-01');
```

### Контрагент-производитель

```sql
INSERT INTO counterparty (name, inn, is_salesman, is_buyer) VALUES
('Молочный завод «Рассвет»', '7701234567', 1, 0);

INSERT INTO counterparty (name, inn, is_salesman, is_buyer) VALUES
('ООО Покупатель',           '7709876543', 0, 1);
```

### Спецификации

```sql
-- Спецификация для йогурта клубничного
INSERT INTO specification (name, product_item_id, output_qty, output_unit, manufacturer_id)
VALUES (
    'Йогурт клубничный — основная',
    (SELECT id FROM item WHERE code = 'PRD-001'),
    1.000, 'шт',
    (SELECT id FROM counterparty WHERE inn = '7701234567')
);

-- Состав: 0.2 л молока + 0.05 кг сахара на 1 шт йогурта
INSERT INTO specification_material (specification_id, material_item_id, qty, unit)
VALUES
((SELECT id FROM specification WHERE name = 'Йогурт клубничный — основная'),
 (SELECT id FROM item WHERE code = 'MAT-001'), 0.200, 'л'),
((SELECT id FROM specification WHERE name = 'Йогурт клубничный — основная'),
 (SELECT id FROM item WHERE code = 'MAT-002'), 0.050, 'кг');

-- Спецификация для напитка какао
INSERT INTO specification (name, product_item_id, output_qty, output_unit, manufacturer_id)
VALUES (
    'Напиток какао — основная',
    (SELECT id FROM item WHERE code = 'PRD-002'),
    1.000, 'шт',
    (SELECT id FROM counterparty WHERE inn = '7701234567')
);

-- Состав: 0.25 л молока + 0.03 кг сахара + 0.02 кг какао на 1 шт напитка
INSERT INTO specification_material (specification_id, material_item_id, qty, unit)
VALUES
((SELECT id FROM specification WHERE name = 'Напиток какао — основная'),
 (SELECT id FROM item WHERE code = 'MAT-001'), 0.250, 'л'),
((SELECT id FROM specification WHERE name = 'Напиток какао — основная'),
 (SELECT id FROM item WHERE code = 'MAT-002'), 0.030, 'кг'),
((SELECT id FROM specification WHERE name = 'Напиток какао — основная'),
 (SELECT id FROM item WHERE code = 'MAT-003'), 0.020, 'кг');
```

### Заказы покупателей

```sql
-- Заказ №1
INSERT INTO customer_order (doc_no, doc_date, customer_id) VALUES
('ЗП-0001', '2026-03-01', (SELECT id FROM counterparty WHERE inn = '7709876543'));

INSERT INTO customer_order_line (customer_order_id, product_item_id, qty, unit) VALUES
((SELECT id FROM customer_order WHERE doc_no = 'ЗП-0001'),
 (SELECT id FROM item WHERE code = 'PRD-001'), 10.000, 'шт'),
((SELECT id FROM customer_order WHERE doc_no = 'ЗП-0001'),
 (SELECT id FROM item WHERE code = 'PRD-002'), 5.000,  'шт');

-- Заказ №2
INSERT INTO customer_order (doc_no, doc_date, customer_id) VALUES
('ЗП-0002', '2026-03-05', (SELECT id FROM counterparty WHERE inn = '7709876543'));

INSERT INTO customer_order_line (customer_order_id, product_item_id, qty, unit) VALUES
((SELECT id FROM customer_order WHERE doc_no = 'ЗП-0002'),
 (SELECT id FROM item WHERE code = 'PRD-002'), 20.000, 'шт');

-- Заказ №3
INSERT INTO customer_order (doc_no, doc_date, customer_id) VALUES
('ЗП-0003', '2026-03-10', (SELECT id FROM counterparty WHERE inn = '7709876543'));

INSERT INTO customer_order_line (customer_order_id, product_item_id, qty, unit) VALUES
((SELECT id FROM customer_order WHERE doc_no = 'ЗП-0003'),
 (SELECT id FROM item WHERE code = 'PRD-001'), 50.000, 'шт');
```

---

## Запрос расчёта полной стоимости заказа

### Вариант 1 — с WITH (MySQL 8+)

```sql
WITH material_cost AS (
    SELECT
        sm.specification_id,
        SUM(sm.qty * p.price) AS cost_per_spec_unit
    FROM specification_material sm
    JOIN (
        SELECT item_id, MAX(effective_from) AS max_date
        FROM price
        WHERE effective_from <= CURDATE()
        GROUP BY item_id
    ) last_price ON sm.material_item_id = last_price.item_id
    JOIN price p ON p.item_id = last_price.item_id
                AND p.effective_from = last_price.max_date
    GROUP BY sm.specification_id
),
product_spec AS (
    SELECT product_item_id, id AS spec_id
    FROM specification
)
SELECT
    co.doc_no        AS order_no,
    co.doc_date,
    i.name           AS product,
    col.qty          AS order_qty,
    mc.cost_per_spec_unit AS material_cost_per_unit,
    col.qty * mc.cost_per_spec_unit AS total_material_cost
FROM customer_order co
JOIN customer_order_line col ON col.customer_order_id = co.id
JOIN item i                  ON i.id = col.product_item_id
JOIN product_spec ps         ON ps.product_item_id = i.id
JOIN material_cost mc        ON mc.specification_id = ps.spec_id
ORDER BY co.doc_no, i.name;
```

### Вариант 2 — подзапрос (универсальный)

```sql
SELECT
    co.doc_no   AS order_no,
    i.name      AS product,
    col.qty     AS order_qty,
    (
        SELECT SUM(sm.qty * p2.price)
        FROM specification s
        JOIN specification_material sm ON sm.specification_id = s.id
        JOIN price p2 ON p2.item_id = sm.material_item_id
            AND p2.effective_from = (
                SELECT MAX(p3.effective_from)
                FROM price p3
                WHERE p3.item_id = sm.material_item_id
                  AND p3.effective_from <= CURDATE()
            )
        WHERE s.product_item_id = col.product_item_id
    ) AS material_cost_per_unit,
    col.qty * (
        SELECT SUM(sm2.qty * p4.price)
        FROM specification s2
        JOIN specification_material sm2 ON sm2.specification_id = s2.id
        JOIN price p4 ON p4.item_id = sm2.material_item_id
            AND p4.effective_from = (
                SELECT MAX(p5.effective_from)
                FROM price p5
                WHERE p5.item_id = sm2.material_item_id
                  AND p5.effective_from <= CURDATE()
            )
        WHERE s2.product_item_id = col.product_item_id
    ) AS total_material_cost
FROM customer_order co
JOIN customer_order_line col ON col.customer_order_id = co.id
JOIN item i ON i.id = col.product_item_id
ORDER BY co.doc_no, i.name;
```

---

## Ожидаемый результат

Расчёт стоимости материалов на единицу продукции:

| Продукт | Материал | Норма | Цена | Стоимость |
|---------|---------|------:|-----:|----------:|
| Йогурт клубничный | Молоко | 0.200 л | 30 ₽/л | 6,00 ₽ |
| Йогурт клубничный | Сахар | 0.050 кг | 50 ₽/кг | 2,50 ₽ |
| **Йогурт клубничный — итого на ед.** | | | | **8,50 ₽** |
| Напиток какао | Молоко | 0.250 л | 30 ₽/л | 7,50 ₽ |
| Напиток какао | Сахар | 0.030 кг | 50 ₽/кг | 1,50 ₽ |
| Напиток какао | Какао | 0.020 кг | 200 ₽/кг | 4,00 ₽ |
| **Напиток какао — итого на ед.** | | | | **13,00 ₽** |

Ожидаемый результат запроса:

| order_no | doc_date | product | order_qty | material_cost_per_unit | total_material_cost |
|----------|----------|---------|----------:|-----------------------:|--------------------:|
| ЗП-0001 | 2026-03-01 | Йогурт клубничный | 10.000 | 8.50 | 85.00 |
| ЗП-0001 | 2026-03-01 | Напиток какао | 5.000 | 13.00 | 65.00 |
| ЗП-0002 | 2026-03-05 | Напиток какао | 20.000 | 13.00 | 260.00 |
| ЗП-0003 | 2026-03-10 | Йогурт клубничный | 50.000 | 8.50 | 425.00 |

---

## Итог по заказу

Предыдущие запросы показывают стоимость по строкам. Запрос ниже складывает строки одного заказа и учитывает объём выпуска по спецификации. Для учебных данных у каждого продукта одна спецификация и у каждого материала есть действующая цена.

```sql
WITH material_cost AS (
    SELECT
        sm.specification_id,
        SUM(sm.qty * p.price) / NULLIF(s.output_qty, 0) AS cost_per_unit
    FROM specification_material sm
    JOIN specification s ON s.id = sm.specification_id
    JOIN price p ON p.id = (
        SELECT p2.id
        FROM price p2
        WHERE p2.item_id = sm.material_item_id
          AND p2.effective_from <= CURDATE()
          AND (p2.effective_to IS NULL OR p2.effective_to >= CURDATE())
        ORDER BY p2.effective_from DESC, p2.id DESC
        LIMIT 1
    )
    GROUP BY sm.specification_id, s.output_qty
)
SELECT
    co.doc_no AS order_no,
    ROUND(SUM(col.qty * mc.cost_per_unit), 2) AS total_order_cost
FROM customer_order co
JOIN customer_order_line col ON col.customer_order_id = co.id
JOIN specification s ON s.product_item_id = col.product_item_id
JOIN material_cost mc ON mc.specification_id = s.id
GROUP BY co.id, co.doc_no
ORDER BY co.doc_no;
```

| Заказ | Итог |
|---|---:|
| ЗП-0001 | 150,00 |
| ЗП-0002 | 260,00 |
| ЗП-0003 | 425,00 |

## Скачать SQL-запрос

[Скачать module3_query.sql](../files/module3_query.sql){ .md-button }
