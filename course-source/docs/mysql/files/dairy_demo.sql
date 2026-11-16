-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `dairy_demo`
--

-- --------------------------------------------------------

--
-- Структура таблицы `cost_calculation`
--

CREATE TABLE `cost_calculation` (
  `id` bigint(20) NOT NULL,
  `calc_date` date DEFAULT NULL,
  `product_item_id` bigint(20) NOT NULL,
  `product_qty` decimal(12,3) NOT NULL DEFAULT 1.000,
  `total_cost` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `cost_calculation`
--

INSERT INTO `cost_calculation` (`id`, `calc_date`, `product_item_id`, `product_qty`, `total_cost`) VALUES
(1, NULL, 6, 1.000, 36.70);

-- --------------------------------------------------------

--
-- Структура таблицы `cost_calculation_line`
--

CREATE TABLE `cost_calculation_line` (
  `id` bigint(20) NOT NULL,
  `cost_calculation_id` bigint(20) NOT NULL,
  `material_item_id` bigint(20) NOT NULL,
  `qty` decimal(12,3) NOT NULL,
  `unit` varchar(32) DEFAULT NULL,
  `unit_cost` decimal(12,2) DEFAULT NULL,
  `line_cost` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `cost_calculation_line`
--

INSERT INTO `cost_calculation_line` (`id`, `cost_calculation_id`, `material_item_id`, `qty`, `unit`, `unit_cost`, `line_cost`) VALUES
(1, 1, 1, 0.900, 'кг', 40.00, 36.00),
(2, 1, 2, 0.070, 'кг', 10.00, 0.70);

-- --------------------------------------------------------

--
-- Структура таблицы `counterparty`
--

CREATE TABLE `counterparty` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `inn` varchar(32) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(64) DEFAULT NULL,
  `is_salesman` tinyint(1) NOT NULL DEFAULT 0,
  `is_buyer` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `counterparty`
--

INSERT INTO `counterparty` (`id`, `name`, `inn`, `address`, `phone`, `is_salesman`, `is_buyer`) VALUES
(1, 'ООО \"Поставка\"', '', 'г.Пятигорск', '+79198634592', 1, 1),
(2, 'ООО \"Кинотеатр Квант\"', '26320045123', 'г. Железноводск, ул. Мира, 123', '+79884581555', 1, 0),
(3, 'ООО \"Ромашка\"', '4140784214', 'г. Омск, ул. Строителей, 294', '+79882584546', 0, 1),
(8, 'ООО \"Новый JDTO\"', '26320045111', 'г. Железноводсу', '+79884581555', 1, 0),
(9, 'ООО \"Ипподром\"', '5874045632', 'г. Уфа, ул. Набережная,  37', '+79627486389', 1, 1),
(10, 'ООО \"Ассоль\"', '2629011278', 'г. Калуга, ул. Пушкина, 94', '+79184572398', 0, 1),
(11, 'ООО Молочный комбинат \"Полесье\"', NULL, NULL, NULL, 1, 0);

-- --------------------------------------------------------

--
-- Структура таблицы `customer_order`
--

CREATE TABLE `customer_order` (
  `id` bigint(20) NOT NULL,
  `doc_no` varchar(64) NOT NULL,
  `doc_date` date DEFAULT NULL,
  `executor_id` bigint(20) DEFAULT NULL,
  `customer_id` bigint(20) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `customer_order`
--

INSERT INTO `customer_order` (`id`, `doc_no`, `doc_date`, `executor_id`, `customer_id`, `total_amount`) VALUES
(1, '2', '2025-06-06', 11, 10, 2488.00);

-- --------------------------------------------------------

--
-- Структура таблицы `customer_order_line`
--

CREATE TABLE `customer_order_line` (
  `id` bigint(20) NOT NULL,
  `customer_order_id` bigint(20) NOT NULL,
  `product_item_id` bigint(20) NOT NULL,
  `qty` decimal(12,3) NOT NULL,
  `unit` varchar(32) DEFAULT NULL,
  `unit_price` decimal(12,2) DEFAULT NULL,
  `line_amount` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `customer_order_line`
--

INSERT INTO `customer_order_line` (`id`, `customer_order_id`, `product_item_id`, `qty`, `unit`, `unit_price`, `line_amount`) VALUES
(1, 1, 3, 12.000, 'шт', 80.00, 960.00),
(2, 1, 4, 9.000, 'шт', 82.00, 738.00),
(3, 1, 5, 10.000, 'шт', 79.00, 790.00);

-- --------------------------------------------------------

--
-- Структура таблицы `item`
--

CREATE TABLE `item` (
  `id` bigint(20) NOT NULL,
  `code` varchar(64) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `item_type` enum('product','material') NOT NULL,
  `unit_default` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `item`
--

INSERT INTO `item` (`id`, `code`, `name`, `item_type`, `unit_default`) VALUES
(1, 'НФ-00000004', 'Молоко нормализованное', 'material', 'кг'),
(2, 'НФ-00000005', 'Закваска сметанная', 'material', 'кг'),
(3, NULL, 'Кефир 2,5% 900г.', 'product', 'шт'),
(4, NULL, 'Кефир 3,2% 900г.', 'product', 'шт'),
(5, NULL, 'Молоко 2,5% 900г.', 'product', 'шт'),
(6, 'НФ-00000006', 'Сметана классическая 15% 540г.', 'product', 'шт'),
(7, NULL, 'Молоко 3,2% 900г.', 'product', NULL),
(8, NULL, 'Сметана классическая 20% 540г.', 'product', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `price`
--

CREATE TABLE `price` (
  `id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `price`
--

INSERT INTO `price` (`id`, `item_id`, `price`, `effective_from`, `effective_to`) VALUES
(1, 2, 45.00, NULL, NULL),
(2, 3, 80.00, NULL, NULL),
(3, 4, 82.00, NULL, NULL),
(4, 5, 70.00, NULL, NULL),
(5, 7, 76.00, NULL, NULL),
(6, 1, 34.00, NULL, NULL),
(7, 6, 89.00, NULL, NULL),
(8, 8, 92.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `production_material_line`
--

CREATE TABLE `production_material_line` (
  `id` bigint(20) NOT NULL,
  `production_order_id` bigint(20) NOT NULL,
  `material_item_id` bigint(20) NOT NULL,
  `qty` decimal(12,3) NOT NULL,
  `unit` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `production_material_line`
--

INSERT INTO `production_material_line` (`id`, `production_order_id`, `material_item_id`, `qty`, `unit`) VALUES
(1, 1, 1, 0.900, 'кг'),
(2, 1, 2, 0.070, 'кг');

-- --------------------------------------------------------

--
-- Структура таблицы `production_order`
--

CREATE TABLE `production_order` (
  `id` bigint(20) NOT NULL,
  `doc_no` varchar(64) NOT NULL,
  `doc_date` date DEFAULT NULL,
  `manufacturer_id` bigint(20) DEFAULT NULL,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `production_order`
--

INSERT INTO `production_order` (`id`, `doc_no`, `doc_date`, `manufacturer_id`, `note`) VALUES
(1, '1', '2025-06-09', 11, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `production_product_line`
--

CREATE TABLE `production_product_line` (
  `id` bigint(20) NOT NULL,
  `production_order_id` bigint(20) NOT NULL,
  `product_item_id` bigint(20) NOT NULL,
  `qty` decimal(12,3) NOT NULL,
  `unit` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `production_product_line`
--

INSERT INTO `production_product_line` (`id`, `production_order_id`, `product_item_id`, `qty`, `unit`) VALUES
(1, 1, 6, 1.000, 'шт');

-- --------------------------------------------------------

--
-- Структура таблицы `specification`
--

CREATE TABLE `specification` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `product_item_id` bigint(20) NOT NULL,
  `output_qty` decimal(12,3) NOT NULL DEFAULT 1.000,
  `output_unit` varchar(32) DEFAULT NULL,
  `manufacturer_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `specification`
--

INSERT INTO `specification` (`id`, `name`, `product_item_id`, `output_qty`, `output_unit`, `manufacturer_id`) VALUES
(1, 'Основная Сметана 15%', 6, 1.000, 'шт', 11);

-- --------------------------------------------------------

--
-- Структура таблицы `specification_material`
--

CREATE TABLE `specification_material` (
  `id` bigint(20) NOT NULL,
  `specification_id` bigint(20) NOT NULL,
  `material_item_id` bigint(20) NOT NULL,
  `qty` decimal(12,3) NOT NULL,
  `unit` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `specification_material`
--

INSERT INTO `specification_material` (`id`, `specification_id`, `material_item_id`, `qty`, `unit`) VALUES
(1, 1, 1, 0.900, 'кг'),
(2, 1, 2, 0.070, 'кг');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `login` varchar(64) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `failed_attempts` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_locked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `cost_calculation`
--
ALTER TABLE `cost_calculation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_costcalc_product` (`product_item_id`);

--
-- Индексы таблицы `cost_calculation_line`
--
ALTER TABLE `cost_calculation_line`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_costline_calc` (`cost_calculation_id`),
  ADD KEY `fk_costline_item` (`material_item_id`);

--
-- Индексы таблицы `counterparty`
--
ALTER TABLE `counterparty`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `customer_order`
--
ALTER TABLE `customer_order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_custorder_executor` (`executor_id`),
  ADD KEY `fk_custorder_customer` (`customer_id`);

--
-- Индексы таблицы `customer_order_line`
--
ALTER TABLE `customer_order_line`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_custline_order` (`customer_order_id`),
  ADD KEY `fk_custline_item` (`product_item_id`);

--
-- Индексы таблицы `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_item_code` (`code`);

--
-- Индексы таблицы `price`
--
ALTER TABLE `price`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_price_item` (`item_id`);

--
-- Индексы таблицы `production_material_line`
--
ALTER TABLE `production_material_line`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_prodmat_order` (`production_order_id`),
  ADD KEY `fk_prodmat_item` (`material_item_id`);

--
-- Индексы таблицы `production_order`
--
ALTER TABLE `production_order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_prodorder_manufacturer` (`manufacturer_id`);

--
-- Индексы таблицы `production_product_line`
--
ALTER TABLE `production_product_line`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_prodprod_order` (`production_order_id`),
  ADD KEY `fk_prodprod_item` (`product_item_id`);

--
-- Индексы таблицы `specification`
--
ALTER TABLE `specification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_spec_product` (`product_item_id`),
  ADD KEY `fk_spec_manufacturer` (`manufacturer_id`);

--
-- Индексы таблицы `specification_material`
--
ALTER TABLE `specification_material`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_spec_material` (`specification_id`,`material_item_id`),
  ADD KEY `fk_specmat_material` (`material_item_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_login` (`login`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `cost_calculation`
--
ALTER TABLE `cost_calculation`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `cost_calculation_line`
--
ALTER TABLE `cost_calculation_line`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `counterparty`
--
ALTER TABLE `counterparty`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT для таблицы `customer_order`
--
ALTER TABLE `customer_order`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `customer_order_line`
--
ALTER TABLE `customer_order_line`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `item`
--
ALTER TABLE `item`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT для таблицы `price`
--
ALTER TABLE `price`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT для таблицы `production_material_line`
--
ALTER TABLE `production_material_line`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `production_order`
--
ALTER TABLE `production_order`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `production_product_line`
--
ALTER TABLE `production_product_line`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `specification`
--
ALTER TABLE `specification`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `specification_material`
--
ALTER TABLE `specification_material`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `cost_calculation`
--
ALTER TABLE `cost_calculation`
  ADD CONSTRAINT `fk_costcalc_product` FOREIGN KEY (`product_item_id`) REFERENCES `item` (`id`) ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `cost_calculation_line`
--
ALTER TABLE `cost_calculation_line`
  ADD CONSTRAINT `fk_costline_calc` FOREIGN KEY (`cost_calculation_id`) REFERENCES `cost_calculation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_costline_item` FOREIGN KEY (`material_item_id`) REFERENCES `item` (`id`) ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `customer_order`
--
ALTER TABLE `customer_order`
  ADD CONSTRAINT `fk_custorder_customer` FOREIGN KEY (`customer_id`) REFERENCES `counterparty` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_custorder_executor` FOREIGN KEY (`executor_id`) REFERENCES `counterparty` (`id`) ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `customer_order_line`
--
ALTER TABLE `customer_order_line`
  ADD CONSTRAINT `fk_custline_item` FOREIGN KEY (`product_item_id`) REFERENCES `item` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_custline_order` FOREIGN KEY (`customer_order_id`) REFERENCES `customer_order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `price`
--
ALTER TABLE `price`
  ADD CONSTRAINT `fk_price_item` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `production_material_line`
--
ALTER TABLE `production_material_line`
  ADD CONSTRAINT `fk_prodmat_item` FOREIGN KEY (`material_item_id`) REFERENCES `item` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_prodmat_order` FOREIGN KEY (`production_order_id`) REFERENCES `production_order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `production_order`
--
ALTER TABLE `production_order`
  ADD CONSTRAINT `fk_prodorder_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `counterparty` (`id`) ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `production_product_line`
--
ALTER TABLE `production_product_line`
  ADD CONSTRAINT `fk_prodprod_item` FOREIGN KEY (`product_item_id`) REFERENCES `item` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_prodprod_order` FOREIGN KEY (`production_order_id`) REFERENCES `production_order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `specification`
--
ALTER TABLE `specification`
  ADD CONSTRAINT `fk_spec_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `counterparty` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_spec_product` FOREIGN KEY (`product_item_id`) REFERENCES `item` (`id`) ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `specification_material`
--
ALTER TABLE `specification_material`
  ADD CONSTRAINT `fk_specmat_material` FOREIGN KEY (`material_item_id`) REFERENCES `item` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_specmat_spec` FOREIGN KEY (`specification_id`) REFERENCES `specification` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
