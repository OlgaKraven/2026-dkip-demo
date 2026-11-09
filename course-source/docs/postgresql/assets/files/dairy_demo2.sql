--
-- PostgreSQL database dump
--


-- Dumped from database version 16.13 (Homebrew)
-- Dumped by pg_dump version 16.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: app; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA app;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: app; Owner: -
--

CREATE FUNCTION app.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cost_calculation; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.cost_calculation (
    id bigint NOT NULL,
    calc_date date,
    product_item_id bigint NOT NULL,
    product_qty numeric(12,3) DEFAULT 1 NOT NULL,
    total_cost numeric(12,2),
    CONSTRAINT cost_calculation_product_qty_check CHECK ((product_qty > (0)::numeric)),
    CONSTRAINT cost_calculation_total_cost_check CHECK ((total_cost >= (0)::numeric))
);


--
-- Name: cost_calculation_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.cost_calculation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cost_calculation_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.cost_calculation_id_seq OWNED BY app.cost_calculation.id;


--
-- Name: cost_calculation_line; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.cost_calculation_line (
    id bigint NOT NULL,
    cost_calculation_id bigint NOT NULL,
    material_item_id bigint NOT NULL,
    qty numeric(12,3) NOT NULL,
    unit text,
    unit_cost numeric(12,2),
    line_cost numeric(12,2),
    CONSTRAINT cost_calculation_line_line_cost_check CHECK ((line_cost >= (0)::numeric)),
    CONSTRAINT cost_calculation_line_qty_check CHECK ((qty > (0)::numeric)),
    CONSTRAINT cost_calculation_line_unit_cost_check CHECK ((unit_cost >= (0)::numeric))
);


--
-- Name: cost_calculation_line_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.cost_calculation_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cost_calculation_line_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.cost_calculation_line_id_seq OWNED BY app.cost_calculation_line.id;


--
-- Name: counterparty; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.counterparty (
    id text NOT NULL,
    name text NOT NULL,
    inn text,
    address text,
    phone text,
    is_salesman boolean DEFAULT false NOT NULL,
    is_buyer boolean DEFAULT false NOT NULL
);


--
-- Name: counterparty_import; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.counterparty_import (
    payload jsonb NOT NULL
);


--
-- Name: customer_order; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.customer_order (
    id bigint NOT NULL,
    doc_no text NOT NULL,
    doc_date date,
    executor_id text,
    customer_id text,
    total_amount numeric(12,2),
    CONSTRAINT customer_order_total_amount_check CHECK ((total_amount >= (0)::numeric))
);


--
-- Name: customer_order_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.customer_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_order_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.customer_order_id_seq OWNED BY app.customer_order.id;


--
-- Name: customer_order_line; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.customer_order_line (
    id bigint NOT NULL,
    customer_order_id bigint NOT NULL,
    product_item_id bigint NOT NULL,
    qty numeric(12,3) NOT NULL,
    unit text,
    unit_price numeric(12,2),
    line_amount numeric(12,2),
    CONSTRAINT customer_order_line_line_amount_check CHECK ((line_amount >= (0)::numeric)),
    CONSTRAINT customer_order_line_qty_check CHECK ((qty > (0)::numeric)),
    CONSTRAINT customer_order_line_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


--
-- Name: customer_order_line_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.customer_order_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_order_line_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.customer_order_line_id_seq OWNED BY app.customer_order_line.id;


--
-- Name: item; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.item (
    id bigint NOT NULL,
    code text,
    name text NOT NULL,
    item_type text NOT NULL,
    unit_default text,
    CONSTRAINT item_item_type_check CHECK ((item_type = ANY (ARRAY['product'::text, 'material'::text])))
);


--
-- Name: item_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: item_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.item_id_seq OWNED BY app.item.id;


--
-- Name: price; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.price (
    id bigint NOT NULL,
    item_id bigint NOT NULL,
    price numeric(12,2) NOT NULL,
    effective_from date,
    effective_to date,
    CONSTRAINT price_check CHECK (((effective_to IS NULL) OR (effective_from IS NULL) OR (effective_to >= effective_from))),
    CONSTRAINT price_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: price_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.price_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: price_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.price_id_seq OWNED BY app.price.id;


--
-- Name: production_material_line; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.production_material_line (
    id bigint NOT NULL,
    production_order_id bigint NOT NULL,
    material_item_id bigint NOT NULL,
    qty numeric(12,3) NOT NULL,
    unit text,
    CONSTRAINT production_material_line_qty_check CHECK ((qty > (0)::numeric))
);


--
-- Name: production_material_line_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.production_material_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: production_material_line_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.production_material_line_id_seq OWNED BY app.production_material_line.id;


--
-- Name: production_order; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.production_order (
    id bigint NOT NULL,
    doc_no text NOT NULL,
    doc_date date,
    manufacturer_id text,
    note text
);


--
-- Name: production_order_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.production_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: production_order_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.production_order_id_seq OWNED BY app.production_order.id;


--
-- Name: production_product_line; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.production_product_line (
    id bigint NOT NULL,
    production_order_id bigint NOT NULL,
    product_item_id bigint NOT NULL,
    qty numeric(12,3) NOT NULL,
    unit text,
    CONSTRAINT production_product_line_qty_check CHECK ((qty > (0)::numeric))
);


--
-- Name: production_product_line_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.production_product_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: production_product_line_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.production_product_line_id_seq OWNED BY app.production_product_line.id;


--
-- Name: specification; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.specification (
    id bigint NOT NULL,
    name text NOT NULL,
    product_item_id bigint NOT NULL,
    output_qty numeric(12,3) DEFAULT 1 NOT NULL,
    output_unit text,
    manufacturer_id text,
    CONSTRAINT specification_output_qty_check CHECK ((output_qty > (0)::numeric))
);


--
-- Name: specification_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.specification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: specification_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.specification_id_seq OWNED BY app.specification.id;


--
-- Name: specification_material; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.specification_material (
    id bigint NOT NULL,
    specification_id bigint NOT NULL,
    material_item_id bigint NOT NULL,
    qty numeric(12,3) NOT NULL,
    unit text,
    CONSTRAINT specification_material_qty_check CHECK ((qty > (0)::numeric))
);


--
-- Name: specification_material_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.specification_material_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: specification_material_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.specification_material_id_seq OWNED BY app.specification_material.id;


--
-- Name: users; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.users (
    id bigint NOT NULL,
    login text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL,
    failed_attempts integer DEFAULT 0 NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_failed_attempts_check CHECK ((failed_attempts >= 0)),
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'user'::text])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.users_id_seq OWNED BY app.users.id;


--
-- Name: cost_calculation id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.cost_calculation ALTER COLUMN id SET DEFAULT nextval('app.cost_calculation_id_seq'::regclass);


--
-- Name: cost_calculation_line id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.cost_calculation_line ALTER COLUMN id SET DEFAULT nextval('app.cost_calculation_line_id_seq'::regclass);


--
-- Name: customer_order id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order ALTER COLUMN id SET DEFAULT nextval('app.customer_order_id_seq'::regclass);


--
-- Name: customer_order_line id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order_line ALTER COLUMN id SET DEFAULT nextval('app.customer_order_line_id_seq'::regclass);


--
-- Name: item id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.item ALTER COLUMN id SET DEFAULT nextval('app.item_id_seq'::regclass);


--
-- Name: price id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.price ALTER COLUMN id SET DEFAULT nextval('app.price_id_seq'::regclass);


--
-- Name: production_material_line id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_material_line ALTER COLUMN id SET DEFAULT nextval('app.production_material_line_id_seq'::regclass);


--
-- Name: production_order id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_order ALTER COLUMN id SET DEFAULT nextval('app.production_order_id_seq'::regclass);


--
-- Name: production_product_line id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_product_line ALTER COLUMN id SET DEFAULT nextval('app.production_product_line_id_seq'::regclass);


--
-- Name: specification id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification ALTER COLUMN id SET DEFAULT nextval('app.specification_id_seq'::regclass);


--
-- Name: specification_material id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification_material ALTER COLUMN id SET DEFAULT nextval('app.specification_material_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.users ALTER COLUMN id SET DEFAULT nextval('app.users_id_seq'::regclass);


--
-- Data for Name: cost_calculation; Type: TABLE DATA; Schema: app; Owner: -
--

INSERT INTO app.cost_calculation VALUES (1, '2025-03-15', 2001, 1.000, 0.00);
INSERT INTO app.cost_calculation VALUES (2, '2025-03-15', 2002, 1.000, 0.00);


--
-- Data for Name: cost_calculation_line; Type: TABLE DATA; Schema: app; Owner: -
--



--
-- Data for Name: counterparty; Type: TABLE DATA; Schema: app; Owner: -
--

INSERT INTO app.counterparty VALUES ('000000001', 'ООО "Поставка"', NULL, 'г.Пятигорск', '+79198634592', true, true);
INSERT INTO app.counterparty VALUES ('000000002', 'ООО "Кинотеатр Квант"', '26320045123', 'г. Железноводск, ул. Мира, 123', '+79884581555', true, false);
INSERT INTO app.counterparty VALUES ('000000008', 'ООО "Новый JDTO"', '26320045111', 'г. Железноводсу', '+79884581555', true, false);
INSERT INTO app.counterparty VALUES ('000000003', 'ООО "Ромашка"', '4140784214', 'г. Омск, ул. Строителей, 294', '+79882584546', false, true);
INSERT INTO app.counterparty VALUES ('000000009', 'ООО "Ипподром"', '5874045632', 'г. Уфа, ул. Набережная,  37', '+79627486389', true, true);
INSERT INTO app.counterparty VALUES ('000000010', 'ООО "Ассоль"', '2629011278', 'г. Калуга, ул. Пушкина, 94', '+79184572398', false, true);


--
-- Data for Name: counterparty_import; Type: TABLE DATA; Schema: app; Owner: -
--



--
-- Data for Name: customer_order; Type: TABLE DATA; Schema: app; Owner: -
--

INSERT INTO app.customer_order VALUES (1, 'ORD-2025-001', '2025-03-01', '000000001', '000000003', 0.00);
INSERT INTO app.customer_order VALUES (2, 'ORD-2025-002', '2025-03-05', '000000002', '000000010', 0.00);
INSERT INTO app.customer_order VALUES (3, 'ORD-2025-003', '2025-03-10', '000000009', '000000001', 0.00);


--
-- Data for Name: customer_order_line; Type: TABLE DATA; Schema: app; Owner: -
--

INSERT INTO app.customer_order_line VALUES (1, 1, 2001, 10.000, 'шт', NULL, NULL);
INSERT INTO app.customer_order_line VALUES (2, 1, 2002, 5.000, 'шт', NULL, NULL);
INSERT INTO app.customer_order_line VALUES (3, 2, 2001, 3.000, 'шт', NULL, NULL);
INSERT INTO app.customer_order_line VALUES (4, 2, 2002, 2.000, 'шт', NULL, NULL);
INSERT INTO app.customer_order_line VALUES (5, 3, 2001, 7.000, 'шт', NULL, NULL);
INSERT INTO app.customer_order_line VALUES (6, 3, 2002, 1.000, 'шт', NULL, NULL);


--
-- Data for Name: item; Type: TABLE DATA; Schema: app; Owner: -
--

INSERT INTO app.item VALUES (1001, 'MAT-001', 'Молоко 3.2%', 'material', 'л');
INSERT INTO app.item VALUES (1002, 'MAT-002', 'Сахар', 'material', 'кг');
INSERT INTO app.item VALUES (1003, 'MAT-003', 'Какао', 'material', 'кг');
INSERT INTO app.item VALUES (2001, 'PRD-001', 'Йогурт клубничный', 'product', 'шт');
INSERT INTO app.item VALUES (2002, 'PRD-002', 'Какао напиток', 'product', 'шт');


--
-- Data for Name: price; Type: TABLE DATA; Schema: app; Owner: -
--

INSERT INTO app.price VALUES (1, 1001, 80.00, '2025-01-01', NULL);
INSERT INTO app.price VALUES (2, 1002, 65.00, '2025-01-01', NULL);
INSERT INTO app.price VALUES (3, 1003, 500.00, '2025-01-01', NULL);


--
-- Data for Name: production_material_line; Type: TABLE DATA; Schema: app; Owner: -
--



--
-- Data for Name: production_order; Type: TABLE DATA; Schema: app; Owner: -
--



--
-- Data for Name: production_product_line; Type: TABLE DATA; Schema: app; Owner: -
--



--
-- Data for Name: specification; Type: TABLE DATA; Schema: app; Owner: -
--

INSERT INTO app.specification VALUES (1, 'Спецификация: Йогурт клубничный', 2001, 1.000, 'шт', NULL);
INSERT INTO app.specification VALUES (2, 'Спецификация: Какао напиток', 2002, 1.000, 'шт', NULL);


--
-- Data for Name: specification_material; Type: TABLE DATA; Schema: app; Owner: -
--

INSERT INTO app.specification_material VALUES (1, 1, 1001, 0.250, 'л');
INSERT INTO app.specification_material VALUES (2, 1, 1002, 0.030, 'кг');
INSERT INTO app.specification_material VALUES (3, 2, 1001, 0.300, 'л');
INSERT INTO app.specification_material VALUES (4, 2, 1002, 0.020, 'кг');
INSERT INTO app.specification_material VALUES (5, 2, 1003, 0.010, 'кг');


--
-- Data for Name: users; Type: TABLE DATA; Schema: app; Owner: -
--

INSERT INTO app.users VALUES (1, 'Admin', '$2a$11$qpOGuZuvMOX53Hw.wh2KLutAuxzDHlCpkVTz35k5xEpfIH0o.hReC', 'admin', 0, false, '2026-01-04 01:39:44.936437+03', '2026-01-04 01:59:51.217078+03');
INSERT INTO app.users VALUES (2, 'user', '$2a$11$fuURuuUq1WFwrJFgG6.Teu2AEGhof2xqmQYQwXNk6487klN4HHRu6', 'user', 0, false, '2026-01-04 02:00:00.375717+03', '2026-01-04 02:00:20.505076+03');


--
-- Name: cost_calculation_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.cost_calculation_id_seq', 1, false);


--
-- Name: cost_calculation_line_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.cost_calculation_line_id_seq', 1, false);


--
-- Name: customer_order_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.customer_order_id_seq', 1, false);


--
-- Name: customer_order_line_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.customer_order_line_id_seq', 1, false);


--
-- Name: item_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.item_id_seq', 1, false);


--
-- Name: price_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.price_id_seq', 1, false);


--
-- Name: production_material_line_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.production_material_line_id_seq', 1, false);


--
-- Name: production_order_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.production_order_id_seq', 1, false);


--
-- Name: production_product_line_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.production_product_line_id_seq', 1, false);


--
-- Name: specification_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.specification_id_seq', 1, false);


--
-- Name: specification_material_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.specification_material_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.users_id_seq', 2, true);


--
-- Name: cost_calculation_line cost_calculation_line_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.cost_calculation_line
    ADD CONSTRAINT cost_calculation_line_pkey PRIMARY KEY (id);


--
-- Name: cost_calculation cost_calculation_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.cost_calculation
    ADD CONSTRAINT cost_calculation_pkey PRIMARY KEY (id);


--
-- Name: counterparty counterparty_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.counterparty
    ADD CONSTRAINT counterparty_pkey PRIMARY KEY (id);


--
-- Name: customer_order_line customer_order_line_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order_line
    ADD CONSTRAINT customer_order_line_pkey PRIMARY KEY (id);


--
-- Name: customer_order customer_order_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order
    ADD CONSTRAINT customer_order_pkey PRIMARY KEY (id);


--
-- Name: item item_code_key; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.item
    ADD CONSTRAINT item_code_key UNIQUE (code);


--
-- Name: item item_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (id);


--
-- Name: price price_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.price
    ADD CONSTRAINT price_pkey PRIMARY KEY (id);


--
-- Name: production_material_line production_material_line_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_material_line
    ADD CONSTRAINT production_material_line_pkey PRIMARY KEY (id);


--
-- Name: production_order production_order_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_order
    ADD CONSTRAINT production_order_pkey PRIMARY KEY (id);


--
-- Name: production_product_line production_product_line_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_product_line
    ADD CONSTRAINT production_product_line_pkey PRIMARY KEY (id);


--
-- Name: specification_material specification_material_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification_material
    ADD CONSTRAINT specification_material_pkey PRIMARY KEY (id);


--
-- Name: specification specification_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification
    ADD CONSTRAINT specification_pkey PRIMARY KEY (id);


--
-- Name: specification_material uq_spec_material; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification_material
    ADD CONSTRAINT uq_spec_material UNIQUE (specification_id, material_item_id);


--
-- Name: users users_login_key; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_price_item; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX idx_price_item ON app.price USING btree (item_id);


--
-- Name: ix_users_login; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX ix_users_login ON app.users USING btree (login);


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON app.users FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: cost_calculation_line cost_calculation_line_cost_calculation_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.cost_calculation_line
    ADD CONSTRAINT cost_calculation_line_cost_calculation_id_fkey FOREIGN KEY (cost_calculation_id) REFERENCES app.cost_calculation(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cost_calculation_line cost_calculation_line_material_item_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.cost_calculation_line
    ADD CONSTRAINT cost_calculation_line_material_item_id_fkey FOREIGN KEY (material_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cost_calculation cost_calculation_product_item_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.cost_calculation
    ADD CONSTRAINT cost_calculation_product_item_id_fkey FOREIGN KEY (product_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_order customer_order_customer_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order
    ADD CONSTRAINT customer_order_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES app.counterparty(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_order customer_order_executor_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order
    ADD CONSTRAINT customer_order_executor_id_fkey FOREIGN KEY (executor_id) REFERENCES app.counterparty(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_order_line customer_order_line_customer_order_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order_line
    ADD CONSTRAINT customer_order_line_customer_order_id_fkey FOREIGN KEY (customer_order_id) REFERENCES app.customer_order(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_order_line customer_order_line_product_item_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order_line
    ADD CONSTRAINT customer_order_line_product_item_id_fkey FOREIGN KEY (product_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: price price_item_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.price
    ADD CONSTRAINT price_item_id_fkey FOREIGN KEY (item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: production_material_line production_material_line_material_item_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_material_line
    ADD CONSTRAINT production_material_line_material_item_id_fkey FOREIGN KEY (material_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: production_material_line production_material_line_production_order_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_material_line
    ADD CONSTRAINT production_material_line_production_order_id_fkey FOREIGN KEY (production_order_id) REFERENCES app.production_order(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: production_order production_order_manufacturer_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_order
    ADD CONSTRAINT production_order_manufacturer_id_fkey FOREIGN KEY (manufacturer_id) REFERENCES app.counterparty(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: production_product_line production_product_line_product_item_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_product_line
    ADD CONSTRAINT production_product_line_product_item_id_fkey FOREIGN KEY (product_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: production_product_line production_product_line_production_order_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_product_line
    ADD CONSTRAINT production_product_line_production_order_id_fkey FOREIGN KEY (production_order_id) REFERENCES app.production_order(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specification specification_manufacturer_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification
    ADD CONSTRAINT specification_manufacturer_id_fkey FOREIGN KEY (manufacturer_id) REFERENCES app.counterparty(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: specification_material specification_material_material_item_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification_material
    ADD CONSTRAINT specification_material_material_item_id_fkey FOREIGN KEY (material_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: specification_material specification_material_specification_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification_material
    ADD CONSTRAINT specification_material_specification_id_fkey FOREIGN KEY (specification_id) REFERENCES app.specification(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: specification specification_product_item_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification
    ADD CONSTRAINT specification_product_item_id_fkey FOREIGN KEY (product_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--


