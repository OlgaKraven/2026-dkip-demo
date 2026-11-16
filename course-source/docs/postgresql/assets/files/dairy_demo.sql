--
-- PostgreSQL database dump
--

\restrict CEoNn8CaxkHCCjd3z4BElZb2jtoWF4dKzO28fTyLx5tsAeB5Bv23Ijmw9vkoy4O

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
    total_cost numeric(12,2)
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
    line_cost numeric(12,2)
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
-- Name: customer_order; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.customer_order (
    id bigint NOT NULL,
    doc_no text NOT NULL,
    doc_date date,
    executor_id text,
    customer_id text,
    total_amount numeric(12,2)
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
    line_amount numeric(12,2)
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
    unit_default text
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
    effective_to date
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
    unit text
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
    unit text
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
    manufacturer_id text
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
    unit text
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
    login character varying(64) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(16) DEFAULT 'user'::character varying NOT NULL,
    failed_attempts integer DEFAULT 0 NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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

COPY app.cost_calculation (id, calc_date, product_item_id, product_qty, total_cost) FROM stdin;
1	\N	6	1.000	36.70
\.


--
-- Data for Name: cost_calculation_line; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.cost_calculation_line (id, cost_calculation_id, material_item_id, qty, unit, unit_cost, line_cost) FROM stdin;
1	1	1	0.900	кг	40.00	36.00
2	1	2	0.070	кг	10.00	0.70
\.


--
-- Data for Name: counterparty; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.counterparty (id, name, inn, address, phone, is_salesman, is_buyer) FROM stdin;
000000001	ООО "Поставка"	\N	г.Пятигорск	+79198634592	t	t
000000002	ООО "Кинотеатр Квант"	26320045123	г. Железноводск, ул. Мира, 123	+79884581555	t	f
000000008	ООО "Новый JDTO"	26320045111	г. Железноводсу	+79884581555	t	f
000000003	ООО "Ромашка"	4140784214	г. Омск, ул. Строителей, 294	+79882584546	f	t
000000009	ООО "Ипподром"	5874045632	г. Уфа, ул. Набережная,  37	+79627486389	t	t
000000010	ООО "Ассоль"	2629011278	г. Калуга, ул. Пушкина, 94	+79184572398	f	t
polese	ООО Молочный комбинат "Полесье"	\N	\N	\N	t	f
\.


--
-- Data for Name: customer_order; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.customer_order (id, doc_no, doc_date, executor_id, customer_id, total_amount) FROM stdin;
1	2	2025-06-06	polese	000000010	2488.00
\.


--
-- Data for Name: customer_order_line; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.customer_order_line (id, customer_order_id, product_item_id, qty, unit, unit_price, line_amount) FROM stdin;
1	1	3	12.000	шт	80.00	960.00
2	1	4	9.000	шт	82.00	738.00
3	1	5	10.000	шт	79.00	790.00
\.


--
-- Data for Name: item; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.item (id, code, name, item_type, unit_default) FROM stdin;
1	НФ-00000004	Молоко нормализованное	material	кг
2	НФ-00000005	Закваска сметанная	material	кг
3	\N	Кефир 2,5% 900г.	product	шт
4	\N	Кефир 3,2% 900г.	product	шт
5	\N	Молоко 2,5% 900г.	product	шт
6	НФ-00000006	Сметана классическая 15% 540г.	product	шт
7	\N	Молоко 3,2% 900г.	product	\N
8	\N	Сметана классическая 20% 540г.	product	\N
\.


--
-- Data for Name: price; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.price (id, item_id, price, effective_from, effective_to) FROM stdin;
1	2	45.00	\N	\N
2	3	80.00	\N	\N
3	4	82.00	\N	\N
4	5	70.00	\N	\N
5	7	76.00	\N	\N
6	1	34.00	\N	\N
7	6	89.00	\N	\N
8	8	92.00	\N	\N
\.


--
-- Data for Name: production_material_line; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.production_material_line (id, production_order_id, material_item_id, qty, unit) FROM stdin;
1	1	1	0.900	кг
2	1	2	0.070	кг
\.


--
-- Data for Name: production_order; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.production_order (id, doc_no, doc_date, manufacturer_id, note) FROM stdin;
1	1	2025-06-09	polese	\N
\.


--
-- Data for Name: production_product_line; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.production_product_line (id, production_order_id, product_item_id, qty, unit) FROM stdin;
1	1	6	1.000	шт
\.


--
-- Data for Name: specification; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.specification (id, name, product_item_id, output_qty, output_unit, manufacturer_id) FROM stdin;
1	Основная Сметана 15%	6	1.000	шт	polese
\.


--
-- Data for Name: specification_material; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.specification_material (id, specification_id, material_item_id, qty, unit) FROM stdin;
1	1	1	0.900	кг
2	1	2	0.070	кг
\.


--
-- Name: cost_calculation_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.cost_calculation_id_seq', 1, true);


--
-- Name: cost_calculation_line_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.cost_calculation_line_id_seq', 2, true);


--
-- Name: customer_order_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.customer_order_id_seq', 1, true);


--
-- Name: customer_order_line_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.customer_order_line_id_seq', 3, true);


--
-- Name: item_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.item_id_seq', 8, true);


--
-- Name: price_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.price_id_seq', 8, true);


--
-- Name: production_material_line_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.production_material_line_id_seq', 2, true);


--
-- Name: production_order_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.production_order_id_seq', 1, true);


--
-- Name: production_product_line_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.production_product_line_id_seq', 1, true);


--
-- Name: specification_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.specification_id_seq', 1, true);


--
-- Name: specification_material_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.specification_material_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.users_id_seq', 3, true);


--
-- Name: cost_calculation_line chk_calculation_line_cost; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.cost_calculation_line
    ADD CONSTRAINT chk_calculation_line_cost CHECK ((line_cost >= (0)::numeric)) NOT VALID;


--
-- Name: cost_calculation_line chk_calculation_line_qty; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.cost_calculation_line
    ADD CONSTRAINT chk_calculation_line_qty CHECK ((qty > (0)::numeric)) NOT VALID;


--
-- Name: cost_calculation_line chk_calculation_line_unit_cost; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.cost_calculation_line
    ADD CONSTRAINT chk_calculation_line_unit_cost CHECK ((unit_cost >= (0)::numeric)) NOT VALID;


--
-- Name: cost_calculation chk_calculation_qty; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.cost_calculation
    ADD CONSTRAINT chk_calculation_qty CHECK ((product_qty > (0)::numeric)) NOT VALID;


--
-- Name: cost_calculation chk_calculation_total; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.cost_calculation
    ADD CONSTRAINT chk_calculation_total CHECK ((total_cost >= (0)::numeric)) NOT VALID;


--
-- Name: customer_order_line chk_customer_line_amount; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.customer_order_line
    ADD CONSTRAINT chk_customer_line_amount CHECK ((line_amount >= (0)::numeric)) NOT VALID;


--
-- Name: customer_order_line chk_customer_line_qty; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.customer_order_line
    ADD CONSTRAINT chk_customer_line_qty CHECK ((qty > (0)::numeric)) NOT VALID;


--
-- Name: customer_order_line chk_customer_line_unit_price; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.customer_order_line
    ADD CONSTRAINT chk_customer_line_unit_price CHECK ((unit_price >= (0)::numeric)) NOT VALID;


--
-- Name: item chk_item_type; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.item
    ADD CONSTRAINT chk_item_type CHECK ((item_type = ANY (ARRAY['product'::text, 'material'::text]))) NOT VALID;


--
-- Name: customer_order chk_order_total; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.customer_order
    ADD CONSTRAINT chk_order_total CHECK ((total_amount >= (0)::numeric)) NOT VALID;


--
-- Name: price chk_price_dates; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.price
    ADD CONSTRAINT chk_price_dates CHECK (((effective_to IS NULL) OR (effective_from IS NULL) OR (effective_to >= effective_from))) NOT VALID;


--
-- Name: price chk_price_nonnegative; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.price
    ADD CONSTRAINT chk_price_nonnegative CHECK ((price >= (0)::numeric)) NOT VALID;


--
-- Name: production_material_line chk_production_material_qty; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.production_material_line
    ADD CONSTRAINT chk_production_material_qty CHECK ((qty > (0)::numeric)) NOT VALID;


--
-- Name: production_product_line chk_production_product_qty; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.production_product_line
    ADD CONSTRAINT chk_production_product_qty CHECK ((qty > (0)::numeric)) NOT VALID;


--
-- Name: specification_material chk_specification_material_qty; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.specification_material
    ADD CONSTRAINT chk_specification_material_qty CHECK ((qty > (0)::numeric)) NOT VALID;


--
-- Name: specification chk_specification_output; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.specification
    ADD CONSTRAINT chk_specification_output CHECK ((output_qty > (0)::numeric)) NOT VALID;


--
-- Name: users chk_users_failed_attempts; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.users
    ADD CONSTRAINT chk_users_failed_attempts CHECK ((failed_attempts >= 0)) NOT VALID;


--
-- Name: users chk_users_role; Type: CHECK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE app.users
    ADD CONSTRAINT chk_users_role CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'user'::character varying])::text[]))) NOT VALID;


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
-- Name: item uq_item_code; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.item
    ADD CONSTRAINT uq_item_code UNIQUE (code);


--
-- Name: specification_material uq_specification_material; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification_material
    ADD CONSTRAINT uq_specification_material UNIQUE (specification_id, material_item_id);


--
-- Name: users uq_users_login; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.users
    ADD CONSTRAINT uq_users_login UNIQUE (login);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: cost_calculation_line fk_cost_calculation_line_cost_calculation_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.cost_calculation_line
    ADD CONSTRAINT fk_cost_calculation_line_cost_calculation_id FOREIGN KEY (cost_calculation_id) REFERENCES app.cost_calculation(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: cost_calculation_line fk_cost_calculation_line_material_item_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.cost_calculation_line
    ADD CONSTRAINT fk_cost_calculation_line_material_item_id FOREIGN KEY (material_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: cost_calculation fk_cost_calculation_product_item_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.cost_calculation
    ADD CONSTRAINT fk_cost_calculation_product_item_id FOREIGN KEY (product_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: customer_order fk_customer_order_customer_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order
    ADD CONSTRAINT fk_customer_order_customer_id FOREIGN KEY (customer_id) REFERENCES app.counterparty(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: customer_order fk_customer_order_executor_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order
    ADD CONSTRAINT fk_customer_order_executor_id FOREIGN KEY (executor_id) REFERENCES app.counterparty(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: customer_order_line fk_customer_order_line_customer_order_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order_line
    ADD CONSTRAINT fk_customer_order_line_customer_order_id FOREIGN KEY (customer_order_id) REFERENCES app.customer_order(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: customer_order_line fk_customer_order_line_product_item_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.customer_order_line
    ADD CONSTRAINT fk_customer_order_line_product_item_id FOREIGN KEY (product_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: price fk_price_item; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.price
    ADD CONSTRAINT fk_price_item FOREIGN KEY (item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: production_material_line fk_production_material_line_material_item_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_material_line
    ADD CONSTRAINT fk_production_material_line_material_item_id FOREIGN KEY (material_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: production_material_line fk_production_material_line_production_order_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_material_line
    ADD CONSTRAINT fk_production_material_line_production_order_id FOREIGN KEY (production_order_id) REFERENCES app.production_order(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: production_order fk_production_order_manufacturer_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_order
    ADD CONSTRAINT fk_production_order_manufacturer_id FOREIGN KEY (manufacturer_id) REFERENCES app.counterparty(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: production_product_line fk_production_product_line_product_item_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_product_line
    ADD CONSTRAINT fk_production_product_line_product_item_id FOREIGN KEY (product_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: production_product_line fk_production_product_line_production_order_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.production_product_line
    ADD CONSTRAINT fk_production_product_line_production_order_id FOREIGN KEY (production_order_id) REFERENCES app.production_order(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: specification fk_specification_manufacturer_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification
    ADD CONSTRAINT fk_specification_manufacturer_id FOREIGN KEY (manufacturer_id) REFERENCES app.counterparty(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: specification_material fk_specification_material_material_item_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification_material
    ADD CONSTRAINT fk_specification_material_material_item_id FOREIGN KEY (material_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: specification_material fk_specification_material_specification_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification_material
    ADD CONSTRAINT fk_specification_material_specification_id FOREIGN KEY (specification_id) REFERENCES app.specification(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: specification fk_specification_product_item_id; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specification
    ADD CONSTRAINT fk_specification_product_item_id FOREIGN KEY (product_item_id) REFERENCES app.item(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- PostgreSQL database dump complete
--

\unrestrict CEoNn8CaxkHCCjd3z4BElZb2jtoWF4dKzO28fTyLx5tsAeB5Bv23Ijmw9vkoy4O

