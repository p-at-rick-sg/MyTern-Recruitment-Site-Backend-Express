--
-- PostgreSQL database dump
--

-- Dumped from database version 15.5
-- Dumped by pg_dump version 16.2 (Postgres.app)

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: access_tokens; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.access_tokens (
    id integer NOT NULL,
    jti character varying(255) NOT NULL,
    session_id integer NOT NULL,
    expires_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '00:30:00'::interval) NOT NULL
);


ALTER TABLE public.access_tokens OWNER TO postgres_user;

--
-- Name: COLUMN access_tokens.expires_at; Type: COMMENT; Schema: public; Owner: postgres_user
--

COMMENT ON COLUMN public.access_tokens.expires_at IS 'auto 30 minute expiry time';


--
-- Name: access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.access_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.access_tokens_id_seq OWNER TO postgres_user;

--
-- Name: access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_user
--

ALTER SEQUENCE public.access_tokens_id_seq OWNED BY public.access_tokens.id;


--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.addresses_id_seq OWNER TO postgres_user;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.addresses (
    id bigint DEFAULT nextval('public.addresses_id_seq'::regclass) NOT NULL,
    address1 character varying NOT NULL,
    address2 character varying,
    city character varying NOT NULL,
    postcode character varying,
    country_id bigint NOT NULL
);


ALTER TABLE public.addresses OWNER TO postgres_user;

--
-- Name: certifications; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.certifications (
    certification_id integer NOT NULL,
    user_id uuid NOT NULL,
    name character varying(127) NOT NULL,
    institution character varying(127),
    year integer,
    CONSTRAINT certifications_year_check CHECK (((year >= 1950) AND (year <= 3000)))
);


ALTER TABLE public.certifications OWNER TO postgres_user;

--
-- Name: certifications_certification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.certifications_certification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certifications_certification_id_seq OWNER TO postgres_user;

--
-- Name: certifications_certification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_user
--

ALTER SEQUENCE public.certifications_certification_id_seq OWNED BY public.certifications.certification_id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.companies (
    id bigint NOT NULL,
    primary_domain character varying NOT NULL,
    total_employees integer,
    name character varying(64) NOT NULL,
    root_user_id uuid
);


ALTER TABLE public.companies OWNER TO postgres_user;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO postgres_user;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_user
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_offices; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.company_offices (
    id bigint NOT NULL,
    company_id bigint,
    primary_contact_id uuid,
    office_telephone character varying,
    office_email character varying,
    address_id integer NOT NULL
);


ALTER TABLE public.company_offices OWNER TO postgres_user;

--
-- Name: company_offices_address_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.company_offices_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_offices_address_id_seq OWNER TO postgres_user;

--
-- Name: company_offices_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_user
--

ALTER SEQUENCE public.company_offices_address_id_seq OWNED BY public.company_offices.address_id;


--
-- Name: company_offices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.company_offices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_offices_id_seq OWNER TO postgres_user;

--
-- Name: company_offices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_user
--

ALTER SEQUENCE public.company_offices_id_seq OWNED BY public.company_offices.id;


--
-- Name: company_sector_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.company_sector_id_seq
    START WITH 100
    INCREMENT BY 2
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_sector_id_seq OWNER TO postgres_user;

--
-- Name: company_sector_link; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.company_sector_link (
    company_id bigint NOT NULL,
    sector_id integer NOT NULL
);


ALTER TABLE public.company_sector_link OWNER TO postgres_user;

--
-- Name: company_sectors; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.company_sectors (
    id bigint DEFAULT nextval('public.company_sector_id_seq'::regclass) NOT NULL,
    sector character varying(30) NOT NULL
);


ALTER TABLE public.company_sectors OWNER TO postgres_user;

--
-- Name: company_users_link; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.company_users_link (
    id bigint NOT NULL,
    user_id uuid,
    company_id bigint,
    office_id bigint,
    role_id smallint,
    "position" character varying(64) NOT NULL,
    manager_id uuid
);


ALTER TABLE public.company_users_link OWNER TO postgres_user;

--
-- Name: company_users_link_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.company_users_link_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_users_link_id_seq OWNER TO postgres_user;

--
-- Name: company_users_link_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_user
--

ALTER SEQUENCE public.company_users_link_id_seq OWNED BY public.company_users_link.id;


--
-- Name: countries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.countries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.countries_id_seq OWNER TO postgres_user;

--
-- Name: countries; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.countries (
    id bigint DEFAULT nextval('public.countries_id_seq'::regclass) NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.countries OWNER TO postgres_user;

--
-- Name: country_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.country_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.country_id_seq OWNER TO postgres_user;

--
-- Name: education; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.education (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    institution character varying(255) NOT NULL,
    qualification character varying(255),
    graduation_year character(4)
);


ALTER TABLE public.education OWNER TO postgres_user;

--
-- Name: education_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.education_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.education_id_seq OWNER TO postgres_user;

--
-- Name: education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_user
--

ALTER SEQUENCE public.education_id_seq OWNED BY public.education.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.roles (
    id smallint NOT NULL,
    name character varying(10) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres_user;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.roles_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres_user;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    expires_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '30 days'::interval) NOT NULL,
    issued_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres_user;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_id_seq OWNER TO postgres_user;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_user
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.skills (
    skill_id integer NOT NULL,
    skill_name character varying(255) NOT NULL
);


ALTER TABLE public.skills OWNER TO postgres_user;

--
-- Name: skills_skill_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.skills_skill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_skill_id_seq OWNER TO postgres_user;

--
-- Name: skills_skill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_user
--

ALTER SEQUENCE public.skills_skill_id_seq OWNED BY public.skills.skill_id;


--
-- Name: user_address_link; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.user_address_link (
    user_id uuid NOT NULL,
    address_id bigint NOT NULL,
    address_type character varying(10) DEFAULT 'primary'::character varying NOT NULL
);


ALTER TABLE public.user_address_link OWNER TO postgres_user;

--
-- Name: user_skills_link; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.user_skills_link (
    user_id uuid NOT NULL,
    skill_id integer NOT NULL,
    level integer DEFAULT 1,
    experience integer DEFAULT 1,
    CONSTRAINT user_skills_link_experience_check CHECK (((experience >= 1) AND (experience <= 50))),
    CONSTRAINT user_skills_link_level_check CHECK (((level >= 1) AND (level <= 5)))
);


ALTER TABLE public.user_skills_link OWNER TO postgres_user;

--
-- Name: user_type_link; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.user_type_link (
    user_id uuid NOT NULL,
    type_id smallint NOT NULL
);


ALTER TABLE public.user_type_link OWNER TO postgres_user;

--
-- Name: user_types; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.user_types (
    id smallint NOT NULL,
    name character varying(10) NOT NULL
);


ALTER TABLE public.user_types OWNER TO postgres_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    first_name character varying,
    last_name character varying,
    summary text
);


ALTER TABLE public.users OWNER TO postgres_user;

--
-- Name: work_experience; Type: TABLE; Schema: public; Owner: postgres_user
--

CREATE TABLE public.work_experience (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    company_name character varying(127) NOT NULL,
    title character varying(127) NOT NULL,
    start_date date,
    end_date date,
    details text,
    "current_role" boolean DEFAULT false
);


ALTER TABLE public.work_experience OWNER TO postgres_user;

--
-- Name: work_experience_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_user
--

CREATE SEQUENCE public.work_experience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_experience_id_seq OWNER TO postgres_user;

--
-- Name: work_experience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_user
--

ALTER SEQUENCE public.work_experience_id_seq OWNED BY public.work_experience.id;


--
-- Name: access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.access_tokens ALTER COLUMN id SET DEFAULT nextval('public.access_tokens_id_seq'::regclass);


--
-- Name: certifications certification_id; Type: DEFAULT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.certifications ALTER COLUMN certification_id SET DEFAULT nextval('public.certifications_certification_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_offices id; Type: DEFAULT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_offices ALTER COLUMN id SET DEFAULT nextval('public.company_offices_id_seq'::regclass);


--
-- Name: company_offices address_id; Type: DEFAULT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_offices ALTER COLUMN address_id SET DEFAULT nextval('public.company_offices_address_id_seq'::regclass);


--
-- Name: company_users_link id; Type: DEFAULT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_users_link ALTER COLUMN id SET DEFAULT nextval('public.company_users_link_id_seq'::regclass);


--
-- Name: education id; Type: DEFAULT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.education ALTER COLUMN id SET DEFAULT nextval('public.education_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: skills skill_id; Type: DEFAULT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.skills ALTER COLUMN skill_id SET DEFAULT nextval('public.skills_skill_id_seq'::regclass);


--
-- Name: work_experience id; Type: DEFAULT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.work_experience ALTER COLUMN id SET DEFAULT nextval('public.work_experience_id_seq'::regclass);


--
-- Data for Name: access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.access_tokens (id, jti, session_id, expires_at) FROM stdin;
59	c04a22f4-fd58-4d79-9667-68e1ea8eadee	62	2024-05-02 13:12:03.341805
56	ace23dde-d2f4-447c-8835-4bf8485d376a	59	2024-05-02 10:09:58.463515
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.addresses (id, address1, address2, city, postcode, country_id) FROM stdin;
21	7 Temasek Blvd	Suntec Tower One	Bugis	098789	1
22	35 Glady St	35 Glady St	Winford	VCW74AT	2
23	2B Loyang Besar Close		Pasir Ris	509045	1
24	100 Nice Street		Punggol	911911	1
26	My Long Road	In the Annex	Manchaster	4CW61AY	2
\.


--
-- Data for Name: certifications; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.certifications (certification_id, user_id, name, institution, year) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.companies (id, primary_domain, total_employees, name, root_user_id) FROM stdin;
27		10	FlexAble Business Solutions Pte Ltd	a4144257-b847-4609-87b1-8e60c07d4ee6
28	gmail.com	10	Daves Cool Company	b82cc633-34f6-4f01-b3df-704a8e990a8a
29	email.com	15	The Fish Company	fe979ee8-02e2-46e6-93c4-71f1373c0e64
\.


--
-- Data for Name: company_offices; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.company_offices (id, company_id, primary_contact_id, office_telephone, office_email, address_id) FROM stdin;
10	27	a4144257-b847-4609-87b1-8e60c07d4ee6	\N	\N	21
11	28	b82cc633-34f6-4f01-b3df-704a8e990a8a	\N	\N	24
12	29	fe979ee8-02e2-46e6-93c4-71f1373c0e64	\N	\N	26
\.


--
-- Data for Name: company_sector_link; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.company_sector_link (company_id, sector_id) FROM stdin;
27	100
28	102
29	116
\.


--
-- Data for Name: company_sectors; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.company_sectors (id, sector) FROM stdin;
100	technology
102	manufacturing
104	petrochem
108	fashion
110	logistics
112	travel
116	food & beverage
120	transport
124	government
126	leisure
128	music
\.


--
-- Data for Name: company_users_link; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.company_users_link (id, user_id, company_id, office_id, role_id, "position", manager_id) FROM stdin;
4	a4144257-b847-4609-87b1-8e60c07d4ee6	27	10	1	Technical Director	\N
5	b82cc633-34f6-4f01-b3df-704a8e990a8a	28	11	1	Head of TA	\N
6	fe979ee8-02e2-46e6-93c4-71f1373c0e64	29	12	1	Dishwasher	\N
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.countries (id, name) FROM stdin;
1	Singapore
2	United Kingdom
3	Malaysia
\.


--
-- Data for Name: education; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.education (id, user_id, institution, qualification, graduation_year) FROM stdin;
10	7adf8371-9148-48c6-b7ad-090016faba21		bsc (hons) information technology (grade - 2:1)	\N
11	7adf8371-9148-48c6-b7ad-090016faba21		advanced gnvq information technology (grade - merit)	\N
12	7adf8371-9148-48c6-b7ad-090016faba21		itil foundation	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.roles (id, name) FROM stdin;
1	admin
2	user
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.sessions (id, user_id, expires_at, issued_at) FROM stdin;
59	b82cc633-34f6-4f01-b3df-704a8e990a8a	2024-06-01 09:39:58.463515	2024-05-02 09:39:58.463515
62	fe979ee8-02e2-46e6-93c4-71f1373c0e64	2024-06-01 12:42:03.341805	2024-05-02 12:42:03.341805
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.skills (skill_id, skill_name) FROM stdin;
2	java
5	angular
6	vue
7	c++
8	c#
9	golang
10	ruby
11	rails
12	php
13	swift
14	scala
15	typescript
16	assembly
17	rust
18	elixir
19	haskell
20	perl
21	dart
22	objective-c
23	kotlin
24	html
25	css
26	jquery
27	django
28	spring
29	restful-api
30	restful-architecture
31	responsive design
32	ui/ux principles
33	qa testing
34	jest
35	mocha
36	chai
37	webpack
38	git
39	scripting
40	github
41	gitlab
42	ci/cd
43	circle ci
44	azure
45	aws amazon web services
46	gcp google cloud platform
47	sql
48	mysql
49	postgres
50	oracle database
51	mongo
52	cassandra
53	firebase
54	oauth
55	database design
56	orm object-relational modelling
57	devops
58	cloud computing
59	iac infrastructure-as-code
60	docker
61	terraform
62	kubernetes
275	it service management | itil
276	technology innovation
277	customer experience
278	process improvement
279	project lifecycle management
3	javascript
4	react
282	express
1	python
242	service delivery
243	incident management
244	change control
245	global it support
206	it systems management
207	team management and development
208	vendor and contract management
209	service delivery, incident management and change control
210	global it support and environment management
211	backup and disaster recovery solutions
212	microsoft technologies
213	network architecture lan/wan
214	networking and telephony technology
215	virtualisation technology
216	cloud technologies
\.


--
-- Data for Name: user_address_link; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.user_address_link (user_id, address_id, address_type) FROM stdin;
7adf8371-9148-48c6-b7ad-090016faba21	22	primary
5010566c-6656-46f4-8ced-72955d0c466a	23	primary
\.


--
-- Data for Name: user_skills_link; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.user_skills_link (user_id, skill_id, level, experience) FROM stdin;
7adf8371-9148-48c6-b7ad-090016faba21	211	1	1
7adf8371-9148-48c6-b7ad-090016faba21	212	1	1
7adf8371-9148-48c6-b7ad-090016faba21	213	1	1
7adf8371-9148-48c6-b7ad-090016faba21	214	1	1
7adf8371-9148-48c6-b7ad-090016faba21	215	1	1
7adf8371-9148-48c6-b7ad-090016faba21	216	1	1
7adf8371-9148-48c6-b7ad-090016faba21	210	2	10
7adf8371-9148-48c6-b7ad-090016faba21	209	4	6
7adf8371-9148-48c6-b7ad-090016faba21	3	3	5
7adf8371-9148-48c6-b7ad-090016faba21	6	1	1
\.


--
-- Data for Name: user_type_link; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.user_type_link (user_id, type_id) FROM stdin;
a4144257-b847-4609-87b1-8e60c07d4ee6	2
7adf8371-9148-48c6-b7ad-090016faba21	1
5010566c-6656-46f4-8ced-72955d0c466a	1
b82cc633-34f6-4f01-b3df-704a8e990a8a	2
fe979ee8-02e2-46e6-93c4-71f1373c0e64	2
\.


--
-- Data for Name: user_types; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.user_types (id, name) FROM stdin;
1	user
2	corp
3	rcrt
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.users (id, email, password_hash, active, created_at, first_name, last_name, summary) FROM stdin;
a4144257-b847-4609-87b1-8e60c07d4ee6	patrick.kittle@flexable.sg	$2b$12$IjtaOQLorU1Zo/eQX4GujeWereSR9r7hshH.g.iCnxTjJvuavII6.	t	2024-04-24 09:55:27.553881	Patrick	Kittle	\N
5010566c-6656-46f4-8ced-72955d0c466a	patrick.kittle@gmail.com	$2b$12$sxtFa5SIJINQwkWkO5I0oOcIvdKUasbJ4NmEs3dicdsDZQCVJ43Pa	t	2024-04-24 11:34:13.824945	patrick	kittle	\N
b82cc633-34f6-4f01-b3df-704a8e990a8a	dave@gmail.com	$2b$12$0LHJndhDZnFQ3q26viWCauzhkiZ9oglm3PNJ8KxNNb.RLE0qU81dm	t	2024-05-01 01:38:35.006472	David	Smith	\N
7adf8371-9148-48c6-b7ad-090016faba21	matt@gmail.com	$2b$12$4ybkWjEyS7fbb6XQHGhNOOe6xP4PyyJSz7dl1Tzl6RtHCwcvQ.PeW	f	2024-04-24 10:00:35.594909	Matthew	Kittle	I am an accomplished IT professional with over 20 years industry experience airbaloonws in the sky...
fe979ee8-02e2-46e6-93c4-71f1373c0e64	dan@email.com	$2b$12$by56M4tgRBLB49xgXPv4.eAITnC1KfyIEdc7DzdXs8TFUweqiyjI2	t	2024-05-02 12:41:45.163746	Dan	Man	\N
\.


--
-- Data for Name: work_experience; Type: TABLE DATA; Schema: public; Owner: postgres_user
--

COPY public.work_experience (id, user_id, company_name, title, start_date, end_date, details, "current_role") FROM stdin;
60	7adf8371-9148-48c6-b7ad-090016faba21	corex group	group it manager	2019-11-01	2024-04-30	Promoted to Group IT Manager after the acquisition of NPAC Holdings by VPK Packaging.\nOverall IT Budget management\nResponsibility for all IT systems\nAll support and change management\nVendors and contracts, including 3rd party support relationships\nKey projects undertaken:\nMigration of on premise to Microsoft 365\nMigration of on premise data centre to Microsoft Azure\nCompany mergers and integrations	f
61	7adf8371-9148-48c6-b7ad-090016faba21	npac holdings	regional it systems manager	2016-03-01	2019-10-31	Responsible, at group level, for the management of the global infrastructure systems and support team at NPAC Holdings.\nI manage a team of 6 staff in locations across Europe, USA and China.\nDelegation and management of support calls\nProvide 3rd line support when required to aid problem resolution\nBackup and disaster recovery management\nIT hardware and systems maintenance\nVendor management for purchasing and support\nContinuous improvement planning\nProject management\nKey projects undertaken:\nMigration of 13 sites to NPACs systems after an acquisition\nImplementation of Meraki LAN and WiFi solution to all locations\nMigration to Skype for Business full voice solution\nActive Directory and Exchange migration for over 600 users\nProvide infrastructure support to a global SAP implementation	f
62	7adf8371-9148-48c6-b7ad-090016faba21	whitecroft lighting ltd	it infrastructure manager	2015-05-01	2016-02-29	Responsible for all IT systems at Whitecroft.\nI managed a team of two staff with varied skill sets.\nContract and vendor management\nChange implementation for new IT systems\nDelegation and management of support calls\nProvide 3rd line support when required to aid problem resolution\nBackup and disaster recovery management\nIT hardware and systems maintenance	f
63	7adf8371-9148-48c6-b7ad-090016faba21	api group plc	infrastructure manager	2012-01-01	2015-03-31	Responsible for the design, maintenance and improvement of all infrastructure systems at API.\nI managed a team of four staff with varied skill sets, based in different geographical locations.\nDelegation and management of support calls\nProvide 3rd line support when required to aid problem resolution\nBackup and disaster recovery management\nIT hardware and systems maintenance\nVendor management for purchasing and support\nContinuous improvement planning\nProject management\nKey projects undertaken:\nMigration of global WAN to a new supplier\nImplementation of a Cisco IP telephony and unified communications platform\nImplementation of highly available Hyper-V clusters in multiple locations\nDevelop backup and disaster recovery strategy to ensure continuous IT services\nUpgrade of global infrastructure to meet the requirements of a new ERP system\nDevelop a strategy and budget for rolling hardware improvements	f
64	7adf8371-9148-48c6-b7ad-090016faba21	api group plc	systems administrator	2004-11-01	2011-12-31	Responsible for ensuring the local infrastructure requirements were maintained and available in line with service level agreements.\nMy principle focus was server architecture, email and desktop systems.\nDay-to-day management of systems (email, internet, security and file and print services)\nDesktop and infrastructure support. 2nd and 3rd line\nRoutine maintenance\nTroubleshoot problems with software, hardware and networks\nCo-ordinate backups and data archiving\nData management\nUpgrades of hardware and software on desktops and servers\nImplementation of new technologies	f
\.


--
-- Name: access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.access_tokens_id_seq', 59, true);


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.addresses_id_seq', 26, true);


--
-- Name: certifications_certification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.certifications_certification_id_seq', 29, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.companies_id_seq', 29, true);


--
-- Name: company_offices_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.company_offices_address_id_seq', 1, false);


--
-- Name: company_offices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.company_offices_id_seq', 12, true);


--
-- Name: company_sector_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.company_sector_id_seq', 128, true);


--
-- Name: company_users_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.company_users_link_id_seq', 6, true);


--
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.countries_id_seq', 3, true);


--
-- Name: country_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.country_id_seq', 1, false);


--
-- Name: education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.education_id_seq', 14, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.sessions_id_seq', 62, true);


--
-- Name: skills_skill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.skills_skill_id_seq', 283, true);


--
-- Name: work_experience_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_user
--

SELECT pg_catalog.setval('public.work_experience_id_seq', 68, true);


--
-- Name: access_tokens access_tokens_jti_key; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.access_tokens
    ADD CONSTRAINT access_tokens_jti_key UNIQUE (jti);


--
-- Name: access_tokens access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.access_tokens
    ADD CONSTRAINT access_tokens_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (certification_id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_offices company_offices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_offices
    ADD CONSTRAINT company_offices_pkey PRIMARY KEY (id);


--
-- Name: company_sector_link company_sector_link_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_sector_link
    ADD CONSTRAINT company_sector_link_pkey PRIMARY KEY (company_id, sector_id);


--
-- Name: company_sectors company_sector_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_sectors
    ADD CONSTRAINT company_sector_pkey PRIMARY KEY (id);


--
-- Name: company_users_link company_users_link_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_users_link
    ADD CONSTRAINT company_users_link_pkey PRIMARY KEY (id);


--
-- Name: countries countries_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_name_key UNIQUE (name);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- Name: education education_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.education
    ADD CONSTRAINT education_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (skill_id);


--
-- Name: skills skills_skill_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_skill_name_key UNIQUE (skill_name);


--
-- Name: user_address_link user_address_link_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.user_address_link
    ADD CONSTRAINT user_address_link_pkey PRIMARY KEY (user_id, address_id);


--
-- Name: user_skills_link user_skills_link_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.user_skills_link
    ADD CONSTRAINT user_skills_link_pkey PRIMARY KEY (user_id, skill_id);


--
-- Name: user_type_link user_type_link_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.user_type_link
    ADD CONSTRAINT user_type_link_pkey PRIMARY KEY (user_id, type_id);


--
-- Name: user_types user_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.user_types
    ADD CONSTRAINT user_types_name_key UNIQUE (name);


--
-- Name: user_types user_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.user_types
    ADD CONSTRAINT user_types_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: work_experience work_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.work_experience
    ADD CONSTRAINT work_experience_pkey PRIMARY KEY (id);


--
-- Name: access_tokens access_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.access_tokens
    ADD CONSTRAINT access_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- Name: access_tokens access_tokens_session_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.access_tokens
    ADD CONSTRAINT access_tokens_session_id_fkey1 FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: addresses addresses_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id);


--
-- Name: certifications certifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: companies companies_root_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_root_user_id_fkey FOREIGN KEY (root_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: company_offices company_offices_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_offices
    ADD CONSTRAINT company_offices_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id);


--
-- Name: company_offices company_offices_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_offices
    ADD CONSTRAINT company_offices_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: company_offices company_offices_primary_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_offices
    ADD CONSTRAINT company_offices_primary_contact_id_fkey FOREIGN KEY (primary_contact_id) REFERENCES public.users(id);


--
-- Name: company_sector_link company_sector_link_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_sector_link
    ADD CONSTRAINT company_sector_link_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: company_sector_link company_sector_link_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_sector_link
    ADD CONSTRAINT company_sector_link_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.company_sectors(id);


--
-- Name: company_users_link company_users_link_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_users_link
    ADD CONSTRAINT company_users_link_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: company_users_link company_users_link_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_users_link
    ADD CONSTRAINT company_users_link_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: company_users_link company_users_link_office_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_users_link
    ADD CONSTRAINT company_users_link_office_id_fkey FOREIGN KEY (office_id) REFERENCES public.company_offices(id);


--
-- Name: company_users_link company_users_link_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_users_link
    ADD CONSTRAINT company_users_link_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: company_users_link company_users_link_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.company_users_link
    ADD CONSTRAINT company_users_link_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: education education_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.education
    ADD CONSTRAINT education_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: certifications fk_user_certification; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT fk_user_certification FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_address_link user_address_link_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.user_address_link
    ADD CONSTRAINT user_address_link_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id);


--
-- Name: user_address_link user_address_link_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.user_address_link
    ADD CONSTRAINT user_address_link_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_skills_link user_skills_link_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.user_skills_link
    ADD CONSTRAINT user_skills_link_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(skill_id) ON DELETE CASCADE;


--
-- Name: user_skills_link user_skills_link_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.user_skills_link
    ADD CONSTRAINT user_skills_link_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_type_link user_type_link_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.user_type_link
    ADD CONSTRAINT user_type_link_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.user_types(id);


--
-- Name: user_type_link user_type_link_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.user_type_link
    ADD CONSTRAINT user_type_link_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: work_experience work_experience_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres_user
--

ALTER TABLE ONLY public.work_experience
    ADD CONSTRAINT work_experience_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_replication_origin_advance(text, pg_lsn); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_advance(text, pg_lsn) TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_replication_origin_create(text); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_create(text) TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_replication_origin_drop(text); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_drop(text) TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_replication_origin_oid(text); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_oid(text) TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_replication_origin_progress(text, boolean); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_progress(text, boolean) TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_replication_origin_session_is_setup(); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_is_setup() TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_replication_origin_session_progress(boolean); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_progress(boolean) TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_replication_origin_session_reset(); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_reset() TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_replication_origin_session_setup(text); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_setup(text) TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_replication_origin_xact_reset(); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_xact_reset() TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_replication_origin_xact_setup(pg_lsn, timestamp with time zone); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_xact_setup(pg_lsn, timestamp with time zone) TO cloudsqlsuperuser;


--
-- Name: FUNCTION pg_show_replication_origin_status(OUT local_id oid, OUT external_id text, OUT remote_lsn pg_lsn, OUT local_lsn pg_lsn); Type: ACL; Schema: pg_catalog; Owner: cloudsqladmin
--

GRANT ALL ON FUNCTION pg_catalog.pg_show_replication_origin_status(OUT local_id oid, OUT external_id text, OUT remote_lsn pg_lsn, OUT local_lsn pg_lsn) TO cloudsqlsuperuser;


--
-- PostgreSQL database dump complete
--

