--
-- PostgreSQL database cluster dump
--

\restrict 9yvfeC834SzGpmodlDfBgga1jn3vPf33y5YJSTk2rBmDuQojVTar0IxHMtJwRLc

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE adcluster;
ALTER ROLE adcluster WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN NOREPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:J/7vp8B723+UZSrKiHclEw==$8Chm+yM5jWyGmiH7mCq9u4TvVdPJFX8Qps9ulah2jdM=:H8txxvrCsGyes5rmMOpuRcqJ43xcpZBvq+zKtUTnDFM=';
CREATE ROLE nicchals;
ALTER ROLE nicchals WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN NOREPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:nSVoi3EAzqsx/OLcQocGcQ==$PJ9ZHpaljg3zIK/ohIxCZ+/o3lFizzYRzvreGvKqCR4=:mkX4502X2vo/PxuAkd4m8P5t/36EmI9JdkNqRwzjmVc=';
CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:qDWCifwwSn28dy3ZQuYssQ==$ps2W4IioTvF0eIDAN997wB9s8niBeWMrPKFY6CrZtCg=:Vfa5nsLX8qh7i/d2p3cCyBzUGSpJjKYEpX2RmLl9u5Q=';

--
-- User Configurations
--








\unrestrict 9yvfeC834SzGpmodlDfBgga1jn3vPf33y5YJSTk2rBmDuQojVTar0IxHMtJwRLc

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict gJyuQgufAW9LrbKU3eEyul5GwsJdHGaTdpYqbp6JWwgLrnq6nOVbbpTkjPMp0Ka

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6 (Homebrew)

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
-- PostgreSQL database dump complete
--

\unrestrict gJyuQgufAW9LrbKU3eEyul5GwsJdHGaTdpYqbp6JWwgLrnq6nOVbbpTkjPMp0Ka

--
-- Database "adcluster_db" dump
--

--
-- PostgreSQL database dump
--

\restrict GCqUVZeUShuIdobH97sy44JhIa9u8Gc8DR3gte1kbID8SHz67hnMX2inkQ8vVqK

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6 (Homebrew)

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
-- Name: adcluster_db; Type: DATABASE; Schema: -; Owner: adcluster
--

CREATE DATABASE adcluster_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';


ALTER DATABASE adcluster_db OWNER TO adcluster;

\unrestrict GCqUVZeUShuIdobH97sy44JhIa9u8Gc8DR3gte1kbID8SHz67hnMX2inkQ8vVqK
\connect adcluster_db
\restrict GCqUVZeUShuIdobH97sy44JhIa9u8Gc8DR3gte1kbID8SHz67hnMX2inkQ8vVqK

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
-- Name: ltree; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS ltree WITH SCHEMA public;


--
-- Name: EXTENSION ltree; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION ltree IS 'data type for hierarchical tree-like structures';


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
-- Name: clbcomments; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.clbcomments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    noteid uuid NOT NULL,
    nodeid uuid NOT NULL,
    prjid uuid NOT NULL,
    comment_creator_uid uuid NOT NULL,
    ctdate timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    ctstate character varying(20) DEFAULT 'begin'::character varying,
    ctupdate timestamp with time zone,
    ctenddate timestamp with time zone,
    ccompleteid uuid
);


ALTER TABLE public.clbcomments OWNER TO adcluster;

--
-- Name: format_categories; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.format_categories (
    category_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    style_id uuid NOT NULL,
    category_name character varying(50) NOT NULL,
    category_name_en character varying(50),
    icon text,
    display_order integer DEFAULT 0,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.format_categories OWNER TO adcluster;

--
-- Name: format_rules; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.format_rules (
    rule_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    category_id uuid NOT NULL,
    style_id uuid NOT NULL,
    element_name character varying(100) NOT NULL,
    element_name_en character varying(100),
    element_code character varying(50),
    setting_value text NOT NULL,
    example_note text,
    css_selector character varying(200),
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.format_rules OWNER TO adcluster;

--
-- Name: gensettings; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.gensettings (
    gstkeyid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    gstkind character varying(20) DEFAULT 'user'::character varying NOT NULL,
    uid uuid NOT NULL,
    gstname character varying(200),
    gstvalue text NOT NULL,
    gsttype character varying(50),
    gstcategory character varying(50),
    gstdescription text,
    gstisactive boolean DEFAULT true,
    gstcreated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    gstupdated_at timestamp with time zone
);


ALTER TABLE public.gensettings OWNER TO adcluster;

--
-- Name: mycitations; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.mycitations (
    mcid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    mcname text NOT NULL,
    mcauthors text NOT NULL,
    mcpublicationyear integer NOT NULL,
    mcsource_type character varying(20) NOT NULL,
    mcpublisher character varying(200),
    mcjorunalnm character varying(200),
    mcvolume character varying(200),
    mcissue character varying(200),
    mcpages character varying(200),
    mcurl text,
    mcaccess_date date,
    mcdoi character varying(200),
    mcnotes text,
    mccreated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    mcupdated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.mycitations OWNER TO adcluster;

--
-- Name: mylib; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.mylib (
    mlid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    mltitle text NOT NULL,
    type text NOT NULL,
    url text,
    author text,
    publisher character varying(200),
    published_date date,
    accessed_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.mylib OWNER TO adcluster;

--
-- Name: mylibitems; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.mylibitems (
    item_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    mlid uuid NOT NULL,
    item_type character varying(20) DEFAULT 'file'::character varying NOT NULL,
    title text NOT NULL,
    url text,
    content jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.mylibitems OWNER TO adcluster;

--
-- Name: mystyles; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.mystyles (
    style_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    style_name character varying(100) NOT NULL,
    style_name_en character varying(100),
    description text,
    version character varying(20) DEFAULT '1.0'::character varying,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.mystyles OWNER TO adcluster;

--
-- Name: mytempletes; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.mytempletes (
    tmpid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tmpkind character varying(255),
    tmpdescription text,
    tmpdisplay_order integer DEFAULT 0,
    tmpcreated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tmpupdated_at timestamp without time zone
);


ALTER TABLE public.mytempletes OWNER TO adcluster;

--
-- Name: mytodolist; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.mytodolist (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    uid uuid NOT NULL,
    prjid uuid NOT NULL,
    tododsporder integer DEFAULT 0 NOT NULL,
    todopriority character varying(20) NOT NULL,
    tododsc text,
    todocreatedt timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    todosttdt timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    todoupdatedt timestamp with time zone,
    todoenddt timestamp with time zone,
    todostatue boolean DEFAULT true
);


ALTER TABLE public.mytodolist OWNER TO adcluster;

--
-- Name: notelib; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.notelib (
    ntlid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    noteid uuid NOT NULL,
    nodeid uuid NOT NULL,
    prjid uuid NOT NULL,
    mlid uuid NOT NULL,
    ntlkind character varying(20),
    ntlsaply integer DEFAULT 0,
    ntleaply integer DEFAULT 0,
    ntldescrption text,
    ntluserid uuid NOT NULL,
    ntldate timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notelib OWNER TO adcluster;

--
-- Name: pnote_citations; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.pnote_citations (
    npcid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    citation_id uuid NOT NULL,
    noteid uuid NOT NULL,
    nodeid uuid NOT NULL,
    prjid uuid NOT NULL,
    npcstnum integer,
    npcednum integer,
    npcstatus boolean DEFAULT true,
    npcctid uuid,
    npcctdate date DEFAULT CURRENT_DATE
);


ALTER TABLE public.pnote_citations OWNER TO adcluster;

--
-- Name: pnote_history; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.pnote_history (
    phid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    noteid uuid NOT NULL,
    nodeid uuid NOT NULL,
    prjid uuid NOT NULL,
    phuserid uuid NOT NULL,
    phmodify text,
    phtext text,
    phmodifysrange integer DEFAULT 0,
    phmodifyerange integer DEFAULT 0,
    phmodifydate timestamp with time zone,
    phcreatedate timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pnote_history OWNER TO adcluster;

--
-- Name: prjuser; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.prjuser (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    prjid uuid NOT NULL,
    uid uuid NOT NULL,
    role character varying(50) DEFAULT 'reader'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.prjuser OWNER TO adcluster;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.projects (
    prjid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    crtid uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    protag text,
    prokey text,
    visibility character varying(50) DEFAULT 'team'::character varying NOT NULL,
    status character varying(50),
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.projects OWNER TO adcluster;

--
-- Name: pronodes; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.pronodes (
    nodeid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    prjid uuid NOT NULL,
    prjid_parents uuid,
    type character varying(50) DEFAULT 'folder'::character varying NOT NULL,
    title character varying(200) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.pronodes OWNER TO adcluster;

--
-- Name: pronote; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.pronote (
    noteid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nodeid uuid NOT NULL,
    prjid uuid NOT NULL,
    note_descrtion text,
    crtid uuid NOT NULL,
    status boolean DEFAULT true,
    create_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    enddate date,
    saveyear integer,
    savestatus boolean DEFAULT true,
    tmpid uuid NOT NULL,
    style_id uuid NOT NULL
);


ALTER TABLE public.pronote OWNER TO adcluster;

--
-- Name: users; Type: TABLE; Schema: public; Owner: adcluster
--

CREATE TABLE public.users (
    uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    uemail character varying(150) NOT NULL,
    upassword character varying(100),
    urole character varying(50) DEFAULT 'user'::character varying,
    uavatar text,
    ucreate_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ulast_login timestamp with time zone,
    uupdated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    uname character varying(100) DEFAULT 'anonymous'::character varying NOT NULL,
    uisdel boolean DEFAULT false,
    uactive boolean DEFAULT true
);


ALTER TABLE public.users OWNER TO adcluster;

--
-- Data for Name: clbcomments; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.clbcomments (id, noteid, nodeid, prjid, comment_creator_uid, ctdate, ctstate, ctupdate, ctenddate, ccompleteid) FROM stdin;
\.


--
-- Data for Name: format_categories; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.format_categories (category_id, style_id, category_name, category_name_en, icon, display_order, description, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: format_rules; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.format_rules (rule_id, category_id, style_id, element_name, element_name_en, element_code, setting_value, example_note, css_selector, is_active, display_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: gensettings; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.gensettings (gstkeyid, gstkind, uid, gstname, gstvalue, gsttype, gstcategory, gstdescription, gstisactive, gstcreated_at, gstupdated_at) FROM stdin;
\.


--
-- Data for Name: mycitations; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.mycitations (mcid, mcname, mcauthors, mcpublicationyear, mcsource_type, mcpublisher, mcjorunalnm, mcvolume, mcissue, mcpages, mcurl, mcaccess_date, mcdoi, mcnotes, mccreated_at, mcupdated_at) FROM stdin;
\.


--
-- Data for Name: mylib; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.mylib (mlid, mltitle, type, url, author, publisher, published_date, accessed_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mylibitems; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.mylibitems (item_id, mlid, item_type, title, url, content, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mystyles; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.mystyles (style_id, style_name, style_name_en, description, version, display_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mytempletes; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.mytempletes (tmpid, tmpkind, tmpdescription, tmpdisplay_order, tmpcreated_at, tmpupdated_at) FROM stdin;
\.


--
-- Data for Name: mytodolist; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.mytodolist (id, uid, prjid, tododsporder, todopriority, tododsc, todocreatedt, todosttdt, todoupdatedt, todoenddt, todostatue) FROM stdin;
\.


--
-- Data for Name: notelib; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.notelib (ntlid, noteid, nodeid, prjid, mlid, ntlkind, ntlsaply, ntleaply, ntldescrption, ntluserid, ntldate) FROM stdin;
\.


--
-- Data for Name: pnote_citations; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.pnote_citations (npcid, citation_id, noteid, nodeid, prjid, npcstnum, npcednum, npcstatus, npcctid, npcctdate) FROM stdin;
\.


--
-- Data for Name: pnote_history; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.pnote_history (phid, noteid, nodeid, prjid, phuserid, phmodify, phtext, phmodifysrange, phmodifyerange, phmodifydate, phcreatedate) FROM stdin;
\.


--
-- Data for Name: prjuser; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.prjuser (id, prjid, uid, role, created_at, update_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.projects (prjid, crtid, title, description, protag, prokey, visibility, status, start_date, end_date, created_at, update_at) FROM stdin;
\.


--
-- Data for Name: pronodes; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.pronodes (nodeid, prjid, prjid_parents, type, title, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pronote; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.pronote (noteid, nodeid, prjid, note_descrtion, crtid, status, create_at, update_at, enddate, saveyear, savestatus, tmpid, style_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: adcluster
--

COPY public.users (uid, uemail, upassword, urole, uavatar, ucreate_at, ulast_login, uupdated_at, uname, uisdel, uactive) FROM stdin;
66b011a3-b8ce-437d-ac17-e4c4db787015	admin@adcluster.com	$2b$12$VoYNJeExJUx5H4GThnTC6OE/7U6M4gSShUsf7M79VjSWsWzk4Vedm	admin	\N	2025-09-07 07:03:12.694116+09	\N	2025-09-07 07:11:14.238118+09	adminuser	f	t
48f85b24-16da-4cbb-a1ae-7f43a2988ea4	testuser@example.com	$2b$12$sMWhWAwq1EHdNxX0sr.98OTcYerxZ9THBjWeKMYYEoBv2YwuEhUX.	user	\N	2025-09-07 19:46:10.776611+09	\N	2025-09-07 19:46:10.776611+09	testuser	f	t
0559988f-e084-4f7a-b6f6-012f411403ac	test@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	user	\N	2025-09-05 08:14:10.405924+09	\N	2025-09-06 17:05:08.755627+09	anonymous	f	t
0b740840-70f0-4bac-99ff-98e56981b7b9	test7@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	user	\N	2025-09-06 17:04:50.72139+09	\N	2025-09-06 17:05:08.755756+09	테스트 사용자 7	f	t
9bacd708-e3e2-4fed-97db-125cac321ffd	deactivated@example.com	$2b$12$sMWhWAwq1EHdNxX0sr.98OTcYerxZ9THBjWeKMYYEoBv2YwuEhUX.	user	\N	2025-09-07 19:46:10.776611+09	\N	2025-09-07 19:46:10.776611+09	deactivated	f	f
24c0978e-c6d9-4327-83cd-6bd1b6a313a8	test2@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	user	\N	2025-09-06 17:04:50.718573+09	\N	2025-09-06 17:05:08.755716+09	테스트 사용자 2	f	t
30696974-79eb-433a-83ee-9a93f1d3328f	test6@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	user	\N	2025-09-06 17:04:50.720815+09	\N	2025-09-06 17:05:08.755748+09	테스트 사용자 6	f	t
392261bd-dc31-4107-870f-df3f8eb00744	test@test.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	user	\N	2025-09-05 08:39:01.161472+09	\N	2025-09-06 17:05:08.75568+09	anonymous	f	t
6dade884-eead-47de-be9d-21328e398d16	nicchals@naver.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	admin	\N	2025-09-05 08:39:37.162536+09	2025-09-05 09:09:03.84607+09	2025-09-06 17:05:08.7557+09	김철호	f	t
76bfbc5e-4088-42a3-83ad-5dcb1921e828	test4@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	user	\N	2025-09-06 17:04:50.719675+09	\N	2025-09-06 17:05:08.755732+09	테스트 사용자 4	f	t
815f124d-b794-44a3-a374-a8c8e985540f	test_1757060098@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	user	\N	2025-09-05 08:14:58.741349+09	\N	2025-09-06 17:05:08.755669+09	anonymous	f	t
8189f799-fa49-4436-bc0b-8214e9afc20c	admin@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	admin	\N	2025-09-05 10:56:18.447055+09	\N	2025-09-06 17:05:08.755689+09	anonymous	f	t
367f1b4e-d402-4d55-bf3e-e0382e9d510b	deleted@example.com	$2b$12$sMWhWAwq1EHdNxX0sr.98OTcYerxZ9THBjWeKMYYEoBv2YwuEhUX.	user	\N	2025-09-07 19:46:10.776611+09	\N	2025-09-07 19:46:10.776611+09	deleted	t	t
acbe943f-194e-40ac-8706-e3f508d775c6	test5@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	user	\N	2025-09-06 17:04:50.720237+09	\N	2025-09-06 17:05:08.75574+09	테스트 사용자 5	f	t
c9e970e4-5da2-42f7-9380-1e71365cf706	test1@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	user	\N	2025-09-06 17:04:50.717893+09	\N	2025-09-06 17:05:08.755708+09	테스트 사용자 1	f	t
caf9bd9a-f9e7-4f25-8e8d-9748f92009d8	admin1@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	admin	\N	2025-09-06 17:04:50.722005+09	\N	2025-09-07 10:48:56.639754+09	관리자	f	t
fc318907-ecef-49ac-a9b9-81914701b619	test3@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	user	\N	2025-09-06 17:04:50.719122+09	\N	2025-09-06 17:05:08.755725+09	테스트 사용자 3	f	t
8a7ccfda-1423-46b1-bc2f-8993b0de4732	test_new@example.com	$2b$12$//zNFEzbgtpfzQWpr/wczev3p7SJK49ri8cosIMisuIXZXH.0iCmu	user	\N	2025-09-07 11:57:00.134378+09	\N	\N	Test User	f	t
85117006-74c4-4d06-adf4-cd9141d592c7	newuser@example.com	$2b$12$U0wtuQIpJbG9L6fA05VZ4OJHHkGfC8.9wqiF/JMy7fqpZqvtmtPI2	user	\N	2025-09-07 04:23:02.718687+09	\N	2025-09-07 04:23:02.718694+09	newuser	f	t
bec134aa-b9c2-4341-90d8-6f32c96a653d	newuser2@example.com	$2b$12$LDIagAH.1/Nc/yhv.qxcUu2Sn6ttoNIFuoTxuGHlG83NZ1FO.YPz6	user	\N	2025-09-07 04:24:02.381031+09	\N	2025-09-07 04:24:02.381037+09	newuser2	f	t
137e3a5d-4472-486f-b56d-09870b17511b	admin@admin.com	$2b$12$.QoTEu7XQNSeXdULb0Cide6IWMZykw4/L1jyT2OD/OLFBq6/Yqs7u	user	\N	2025-09-07 07:05:28.681307+09	\N	2025-09-07 07:05:28.681312+09	administrator	f	t
117ce96d-c4c0-4ee9-8157-1128f5b17713	newadmin@example.com	$2b$12$4S6JvJNjeErqi9WrGXdRA.ftIqmUrIKbyC2RIrYQsXNTH1yrjy30.	user	\N	2025-09-07 07:06:58.525249+09	\N	2025-09-07 07:06:58.525254+09	newadmin	f	t
5047f969-be3d-4a47-abe3-7811e53364d0	newadmin@adcluster.com	$2b$12$ubXklbJ9xPhaX2Le2eVkfO3Yyz7rzWhCSEc6volExuRp0G6NXJ3le	user	\N	2025-09-07 07:09:21.346617+09	\N	2025-09-07 07:09:21.346622+09	newadministrator	f	t
12c61eda-21a9-42c3-8c69-0b216bb21cfa	admin2@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	admin	\N	2025-09-06 17:04:50.722631+09	\N	2025-09-07 07:19:54.291999+09	관리자 2	f	t
8e6ac8c3-dcbc-4614-9df1-2042d006889a	viewer1@example.com	$2b$12$nVnOXUNW2Q9aF.pz88cNt.Fv0GQmPGpoJQVeL83QF6IzFq0P7OWNC	viewer	\N	2025-09-06 17:04:50.723211+09	\N	2025-09-07 07:36:24.278553+09	뷰어 1	f	f
d35fe39b-84b5-44a7-9641-f89a34454451	testuser123@example.com	$2b$12$Fbz7m6Fev7zZ0v2PsCMQcOEMRx4EvRhOuJxa/lrbOGufgXUnpPcde	user	\N	2025-09-07 07:55:49.044562+09	\N	2025-09-07 07:55:49.044568+09	testuser123	f	t
b30507a8-cf6b-44d6-aeba-237cf863b61c	testuser456@example.com	$2b$12$3luH4L6l2A4qstSGD1oJhOJKYubhc3IK7tdsZaEvv6aE9cQlLYQ3K	user	\N	2025-09-07 07:58:55.948472+09	\N	2025-09-07 07:58:55.948479+09	testuser456	f	t
49fa573a-7ce0-4aba-a6ed-dee7fb7bba4c	testuser789@example.com	$2b$12$nxqYci2OA4/r30591WiAMOWsaPZSLsloAFzFx/6VIuMGE26PHRlJS	user	\N	2025-09-07 08:02:11.43724+09	\N	2025-09-07 08:02:11.437259+09	testuser789	f	t
3efe5f8c-3c38-4fee-b3ce-a1e8fb542d3a	testuser999@example.com	$2b$12$8HPoMpq.FSUVDSI0Axdvbev2wOWPoy0NfmoW5fKwW760JfNul3QRa	user	\N	2025-09-07 08:02:23.136438+09	\N	2025-09-07 08:02:23.136444+09	testuser999	f	t
a68e0503-1a7b-4926-86b7-07e15ca0426a	testuser111@example.com	$2b$12$lzrrRHBeeuTvklbgDJjZ..XT/R2LemAZptuznyHrI5.rRNzqiDamq	user	\N	2025-09-07 08:03:00.420179+09	\N	2025-09-07 08:03:00.420185+09	testuser111	f	t
702132e6-676b-4b0b-b439-1701a5018ee4	testuser222@example.com	$2b$12$qHlSRiCELU1zOtcrmvkhFe93ydEvaTKtU43va6r3GB0RewQs/5aQ.	user	\N	2025-09-07 08:03:54.545166+09	\N	2025-09-07 08:03:54.545171+09	testuser222	f	t
cc4fe437-3219-4170-afef-64eef65a9b56	testuser333@example.com	$2b$12$b3w8Gp/13SRP62xsVxtA2eWckEU/Aj4hIyasWHU7/rHTWajvUQkXi	user	\N	2025-09-07 08:04:06.24916+09	\N	2025-09-07 08:04:06.249166+09	testuser333	f	t
1df34212-6778-4c0c-a3ca-609966569b94	testuser555@example.com	$2b$12$9lKEohBNenqAM9CrU2gsvOQUK4me5RpK3crZ.DnNWc4h9GQvNcrqS	user	\N	2025-09-07 08:12:07.395656+09	\N	2025-09-07 08:12:07.395662+09	testuser555	f	t
a74e5f0d-d912-4327-9708-fd5292100c40	nicchals1@naver.com	$2b$12$85Z57WMQHu2yo0M9qaxLvea6JlhzVD1iTCjEhRKcCk2FA.Xbqpxfq	user	\N	2025-09-07 08:12:53.837871+09	\N	2025-09-07 08:12:53.837876+09	chulhokim	f	t
165ab763-b0eb-4a90-a227-71bc7b4f14ba	testuser666@example.com	$2b$12$WZvwhjlyCJq2XRqUrAlhTO1HzwHGrvnFjTREkwaunxMpMfIuD2uvy	user	\N	2025-09-07 08:36:13.074865+09	\N	2025-09-07 08:36:13.074871+09	testuser666	f	t
\.


--
-- Name: clbcomments clbcomments_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.clbcomments
    ADD CONSTRAINT clbcomments_pkey PRIMARY KEY (id);


--
-- Name: format_categories format_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.format_categories
    ADD CONSTRAINT format_categories_pkey PRIMARY KEY (category_id);


--
-- Name: format_rules format_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.format_rules
    ADD CONSTRAINT format_rules_pkey PRIMARY KEY (rule_id);


--
-- Name: gensettings gensettings_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.gensettings
    ADD CONSTRAINT gensettings_pkey PRIMARY KEY (gstkeyid);


--
-- Name: mycitations mycitations_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.mycitations
    ADD CONSTRAINT mycitations_pkey PRIMARY KEY (mcid);


--
-- Name: mylib mylib_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.mylib
    ADD CONSTRAINT mylib_pkey PRIMARY KEY (mlid);


--
-- Name: mylibitems mylibitems_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.mylibitems
    ADD CONSTRAINT mylibitems_pkey PRIMARY KEY (item_id);


--
-- Name: mystyles mystyles_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.mystyles
    ADD CONSTRAINT mystyles_pkey PRIMARY KEY (style_id);


--
-- Name: mytempletes mytempletes_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.mytempletes
    ADD CONSTRAINT mytempletes_pkey PRIMARY KEY (tmpid);


--
-- Name: mytodolist mytodolist_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.mytodolist
    ADD CONSTRAINT mytodolist_pkey PRIMARY KEY (id);


--
-- Name: notelib notelib_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.notelib
    ADD CONSTRAINT notelib_pkey PRIMARY KEY (ntlid);


--
-- Name: pnote_citations pnote_citations_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pnote_citations
    ADD CONSTRAINT pnote_citations_pkey PRIMARY KEY (npcid);


--
-- Name: pnote_history pnote_history_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pnote_history
    ADD CONSTRAINT pnote_history_pkey PRIMARY KEY (phid);


--
-- Name: prjuser prjuser_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.prjuser
    ADD CONSTRAINT prjuser_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (prjid);


--
-- Name: pronodes pronodes_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pronodes
    ADD CONSTRAINT pronodes_pkey PRIMARY KEY (nodeid);


--
-- Name: pronote pronote_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pronote
    ADD CONSTRAINT pronote_pkey PRIMARY KEY (noteid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);


--
-- Name: users users_uemail_key; Type: CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uemail_key UNIQUE (uemail);


--
-- Name: idx_clbcomments_comment_creator_uid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_clbcomments_comment_creator_uid ON public.clbcomments USING btree (comment_creator_uid);


--
-- Name: idx_clbcomments_ctstate; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_clbcomments_ctstate ON public.clbcomments USING btree (ctstate);


--
-- Name: idx_clbcomments_nodeid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_clbcomments_nodeid ON public.clbcomments USING btree (nodeid);


--
-- Name: idx_clbcomments_noteid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_clbcomments_noteid ON public.clbcomments USING btree (noteid);


--
-- Name: idx_clbcomments_prjid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_clbcomments_prjid ON public.clbcomments USING btree (prjid);


--
-- Name: idx_format_categories_name_active; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_format_categories_name_active ON public.format_categories USING btree (category_name, is_active);


--
-- Name: idx_format_categories_style_id; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_format_categories_style_id ON public.format_categories USING btree (style_id);


--
-- Name: idx_format_rules_category_id; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_format_rules_category_id ON public.format_rules USING btree (category_id);


--
-- Name: idx_format_rules_element_name_active; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_format_rules_element_name_active ON public.format_rules USING btree (element_name, is_active);


--
-- Name: idx_format_rules_style_id; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_format_rules_style_id ON public.format_rules USING btree (style_id);


--
-- Name: idx_gensettings_gstname; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_gensettings_gstname ON public.gensettings USING btree (gstname);


--
-- Name: idx_gensettings_kind_type_category; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_gensettings_kind_type_category ON public.gensettings USING btree (gstkind, gsttype, gstcategory);


--
-- Name: idx_gensettings_uid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_gensettings_uid ON public.gensettings USING btree (uid);


--
-- Name: idx_mycitations_authors_year; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mycitations_authors_year ON public.mycitations USING btree (mcauthors, mcpublicationyear);


--
-- Name: idx_mycitations_mcname; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mycitations_mcname ON public.mycitations USING btree (mcname);


--
-- Name: idx_mycitations_sourcetype; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mycitations_sourcetype ON public.mycitations USING btree (mcsource_type);


--
-- Name: idx_mylib_author; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mylib_author ON public.mylib USING btree (author);


--
-- Name: idx_mylib_mltitle; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mylib_mltitle ON public.mylib USING btree (mltitle);


--
-- Name: idx_mylib_type; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mylib_type ON public.mylib USING btree (type);


--
-- Name: idx_mylibitems_mlid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mylibitems_mlid ON public.mylibitems USING btree (mlid);


--
-- Name: idx_mylibitems_type_title; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mylibitems_type_title ON public.mylibitems USING btree (item_type, title);


--
-- Name: idx_mystyles_style_name; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mystyles_style_name ON public.mystyles USING btree (style_name);


--
-- Name: idx_mytempletes_tmpkind; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mytempletes_tmpkind ON public.mytempletes USING btree (tmpkind);


--
-- Name: idx_mytodolist_enddt; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mytodolist_enddt ON public.mytodolist USING btree (todoenddt);


--
-- Name: idx_mytodolist_prjid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mytodolist_prjid ON public.mytodolist USING btree (prjid);


--
-- Name: idx_mytodolist_status_priority; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mytodolist_status_priority ON public.mytodolist USING btree (todostatue, todopriority);


--
-- Name: idx_mytodolist_uid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_mytodolist_uid ON public.mytodolist USING btree (uid);


--
-- Name: idx_notelib_mlid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_notelib_mlid ON public.notelib USING btree (mlid);


--
-- Name: idx_notelib_nodeid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_notelib_nodeid ON public.notelib USING btree (nodeid);


--
-- Name: idx_notelib_noteid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_notelib_noteid ON public.notelib USING btree (noteid);


--
-- Name: idx_notelib_ntlkind; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_notelib_ntlkind ON public.notelib USING btree (ntlkind);


--
-- Name: idx_notelib_ntluserid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_notelib_ntluserid ON public.notelib USING btree (ntluserid);


--
-- Name: idx_notelib_prjid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_notelib_prjid ON public.notelib USING btree (prjid);


--
-- Name: idx_pnote_citations_citation_id; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pnote_citations_citation_id ON public.pnote_citations USING btree (citation_id);


--
-- Name: idx_pnote_citations_nodeid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pnote_citations_nodeid ON public.pnote_citations USING btree (nodeid);


--
-- Name: idx_pnote_citations_noteid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pnote_citations_noteid ON public.pnote_citations USING btree (noteid);


--
-- Name: idx_pnote_citations_prjid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pnote_citations_prjid ON public.pnote_citations USING btree (prjid);


--
-- Name: idx_pnote_citations_status; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pnote_citations_status ON public.pnote_citations USING btree (npcstatus);


--
-- Name: idx_pnote_history_nodeid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pnote_history_nodeid ON public.pnote_history USING btree (nodeid);


--
-- Name: idx_pnote_history_noteid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pnote_history_noteid ON public.pnote_history USING btree (noteid);


--
-- Name: idx_pnote_history_phcreatedate; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pnote_history_phcreatedate ON public.pnote_history USING btree (phcreatedate);


--
-- Name: idx_pnote_history_phuserid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pnote_history_phuserid ON public.pnote_history USING btree (phuserid);


--
-- Name: idx_pnote_history_prjid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pnote_history_prjid ON public.pnote_history USING btree (prjid);


--
-- Name: idx_prjuser_prjid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_prjuser_prjid ON public.prjuser USING btree (prjid);


--
-- Name: idx_prjuser_role; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_prjuser_role ON public.prjuser USING btree (role);


--
-- Name: idx_prjuser_uid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_prjuser_uid ON public.prjuser USING btree (uid);


--
-- Name: idx_projects_crtid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_projects_crtid ON public.projects USING btree (crtid);


--
-- Name: idx_projects_title; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_projects_title ON public.projects USING btree (title);


--
-- Name: idx_pronodes_prjid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pronodes_prjid ON public.pronodes USING btree (prjid);


--
-- Name: idx_pronodes_prjid_parents; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pronodes_prjid_parents ON public.pronodes USING btree (prjid_parents);


--
-- Name: idx_pronodes_type_title; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pronodes_type_title ON public.pronodes USING btree (type, title);


--
-- Name: idx_pronote_crtid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pronote_crtid ON public.pronote USING btree (crtid);


--
-- Name: idx_pronote_nodeid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pronote_nodeid ON public.pronote USING btree (nodeid);


--
-- Name: idx_pronote_prjid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pronote_prjid ON public.pronote USING btree (prjid);


--
-- Name: idx_pronote_saveyear_status; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pronote_saveyear_status ON public.pronote USING btree (saveyear, savestatus);


--
-- Name: idx_pronote_style_id; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pronote_style_id ON public.pronote USING btree (style_id);


--
-- Name: idx_pronote_tmpid; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_pronote_tmpid ON public.pronote USING btree (tmpid);


--
-- Name: idx_users_uemail; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_users_uemail ON public.users USING btree (uemail);


--
-- Name: idx_users_uisdel; Type: INDEX; Schema: public; Owner: adcluster
--

CREATE INDEX idx_users_uisdel ON public.users USING btree (uisdel);


--
-- Name: clbcomments clbcomments_ccompleteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.clbcomments
    ADD CONSTRAINT clbcomments_ccompleteid_fkey FOREIGN KEY (ccompleteid) REFERENCES public.users(uid);


--
-- Name: clbcomments clbcomments_comment_creator_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.clbcomments
    ADD CONSTRAINT clbcomments_comment_creator_uid_fkey FOREIGN KEY (comment_creator_uid) REFERENCES public.users(uid);


--
-- Name: clbcomments clbcomments_nodeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.clbcomments
    ADD CONSTRAINT clbcomments_nodeid_fkey FOREIGN KEY (nodeid) REFERENCES public.pronodes(nodeid);


--
-- Name: clbcomments clbcomments_noteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.clbcomments
    ADD CONSTRAINT clbcomments_noteid_fkey FOREIGN KEY (noteid) REFERENCES public.pronote(noteid);


--
-- Name: clbcomments clbcomments_prjid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.clbcomments
    ADD CONSTRAINT clbcomments_prjid_fkey FOREIGN KEY (prjid) REFERENCES public.projects(prjid);


--
-- Name: format_categories format_categories_style_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.format_categories
    ADD CONSTRAINT format_categories_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.mystyles(style_id);


--
-- Name: format_rules format_rules_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.format_rules
    ADD CONSTRAINT format_rules_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.format_categories(category_id);


--
-- Name: format_rules format_rules_style_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.format_rules
    ADD CONSTRAINT format_rules_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.mystyles(style_id);


--
-- Name: gensettings gensettings_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.gensettings
    ADD CONSTRAINT gensettings_uid_fkey FOREIGN KEY (uid) REFERENCES public.users(uid);


--
-- Name: mylibitems mylibitems_mlid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.mylibitems
    ADD CONSTRAINT mylibitems_mlid_fkey FOREIGN KEY (mlid) REFERENCES public.mylib(mlid);


--
-- Name: mytodolist mytodolist_prjid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.mytodolist
    ADD CONSTRAINT mytodolist_prjid_fkey FOREIGN KEY (prjid) REFERENCES public.projects(prjid);


--
-- Name: mytodolist mytodolist_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.mytodolist
    ADD CONSTRAINT mytodolist_uid_fkey FOREIGN KEY (uid) REFERENCES public.users(uid);


--
-- Name: notelib notelib_mlid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.notelib
    ADD CONSTRAINT notelib_mlid_fkey FOREIGN KEY (mlid) REFERENCES public.mylib(mlid);


--
-- Name: notelib notelib_nodeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.notelib
    ADD CONSTRAINT notelib_nodeid_fkey FOREIGN KEY (nodeid) REFERENCES public.pronodes(nodeid);


--
-- Name: notelib notelib_noteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.notelib
    ADD CONSTRAINT notelib_noteid_fkey FOREIGN KEY (noteid) REFERENCES public.pronote(noteid);


--
-- Name: notelib notelib_ntluserid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.notelib
    ADD CONSTRAINT notelib_ntluserid_fkey FOREIGN KEY (ntluserid) REFERENCES public.users(uid);


--
-- Name: notelib notelib_prjid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.notelib
    ADD CONSTRAINT notelib_prjid_fkey FOREIGN KEY (prjid) REFERENCES public.projects(prjid);


--
-- Name: pnote_citations pnote_citations_citation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pnote_citations
    ADD CONSTRAINT pnote_citations_citation_id_fkey FOREIGN KEY (citation_id) REFERENCES public.mycitations(mcid);


--
-- Name: pnote_citations pnote_citations_nodeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pnote_citations
    ADD CONSTRAINT pnote_citations_nodeid_fkey FOREIGN KEY (nodeid) REFERENCES public.pronodes(nodeid);


--
-- Name: pnote_citations pnote_citations_noteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pnote_citations
    ADD CONSTRAINT pnote_citations_noteid_fkey FOREIGN KEY (noteid) REFERENCES public.pronote(noteid);


--
-- Name: pnote_citations pnote_citations_prjid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pnote_citations
    ADD CONSTRAINT pnote_citations_prjid_fkey FOREIGN KEY (prjid) REFERENCES public.projects(prjid);


--
-- Name: pnote_history pnote_history_nodeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pnote_history
    ADD CONSTRAINT pnote_history_nodeid_fkey FOREIGN KEY (nodeid) REFERENCES public.pronodes(nodeid);


--
-- Name: pnote_history pnote_history_noteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pnote_history
    ADD CONSTRAINT pnote_history_noteid_fkey FOREIGN KEY (noteid) REFERENCES public.pronote(noteid);


--
-- Name: pnote_history pnote_history_phuserid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pnote_history
    ADD CONSTRAINT pnote_history_phuserid_fkey FOREIGN KEY (phuserid) REFERENCES public.users(uid);


--
-- Name: pnote_history pnote_history_prjid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pnote_history
    ADD CONSTRAINT pnote_history_prjid_fkey FOREIGN KEY (prjid) REFERENCES public.projects(prjid);


--
-- Name: prjuser prjuser_prjid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.prjuser
    ADD CONSTRAINT prjuser_prjid_fkey FOREIGN KEY (prjid) REFERENCES public.projects(prjid);


--
-- Name: prjuser prjuser_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.prjuser
    ADD CONSTRAINT prjuser_uid_fkey FOREIGN KEY (uid) REFERENCES public.users(uid);


--
-- Name: projects projects_crtid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_crtid_fkey FOREIGN KEY (crtid) REFERENCES public.users(uid);


--
-- Name: pronodes pronodes_prjid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pronodes
    ADD CONSTRAINT pronodes_prjid_fkey FOREIGN KEY (prjid) REFERENCES public.projects(prjid);


--
-- Name: pronodes pronodes_prjid_parents_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pronodes
    ADD CONSTRAINT pronodes_prjid_parents_fkey FOREIGN KEY (prjid_parents) REFERENCES public.pronodes(nodeid);


--
-- Name: pronote pronote_crtid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pronote
    ADD CONSTRAINT pronote_crtid_fkey FOREIGN KEY (crtid) REFERENCES public.users(uid);


--
-- Name: pronote pronote_nodeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pronote
    ADD CONSTRAINT pronote_nodeid_fkey FOREIGN KEY (nodeid) REFERENCES public.pronodes(nodeid);


--
-- Name: pronote pronote_prjid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pronote
    ADD CONSTRAINT pronote_prjid_fkey FOREIGN KEY (prjid) REFERENCES public.projects(prjid);


--
-- Name: pronote pronote_style_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pronote
    ADD CONSTRAINT pronote_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.mystyles(style_id);


--
-- Name: pronote pronote_tmpid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: adcluster
--

ALTER TABLE ONLY public.pronote
    ADD CONSTRAINT pronote_tmpid_fkey FOREIGN KEY (tmpid) REFERENCES public.mytempletes(tmpid);


--
-- PostgreSQL database dump complete
--

\unrestrict GCqUVZeUShuIdobH97sy44JhIa9u8Gc8DR3gte1kbID8SHz67hnMX2inkQ8vVqK

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict A7VhmBLGyrFufOTcbz22FgXeLXdy0vVivpIKbhyt0sI4C3ciZ7vcSLe21gYCYfc

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6 (Homebrew)

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
-- PostgreSQL database dump complete
--

\unrestrict A7VhmBLGyrFufOTcbz22FgXeLXdy0vVivpIKbhyt0sI4C3ciZ7vcSLe21gYCYfc

--
-- PostgreSQL database cluster dump complete
--

