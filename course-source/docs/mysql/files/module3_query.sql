-- Модуль 3. Запрос расчёта полной стоимости заказа
-- База данных: dairy_demo

-- Вариант 1 — с WITH (MySQL 8+)
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


-- Вариант 2 — подзапрос (универсальный, MySQL 5.7+)
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

-- Итог по заказу (MySQL 8+)
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
