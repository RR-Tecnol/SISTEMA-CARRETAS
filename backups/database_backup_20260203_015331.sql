--
-- PostgreSQL database dump
--

\restrict m0CjgMLs9DsAokDLQoREXX6pqGx2wKB8sNd1RWBpIhfqsgBk9hbU3O3IQiMYjWZ

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: abastecimentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.abastecimentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    acao_id uuid,
    caminhao_id uuid,
    data_abastecimento date NOT NULL,
    litros numeric(10,2) NOT NULL,
    valor_total numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    preco_por_litro numeric(6,3),
    observacoes text
);


ALTER TABLE public.abastecimentos OWNER TO postgres;

--
-- Name: acao_caminhoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.acao_caminhoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    acao_id uuid,
    caminhao_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.acao_caminhoes OWNER TO postgres;

--
-- Name: acao_curso_exame; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.acao_curso_exame (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    acao_id uuid NOT NULL,
    curso_exame_id uuid NOT NULL,
    vagas integer DEFAULT 0 NOT NULL,
    horarios jsonb DEFAULT '[]'::jsonb,
    campos_customizados jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.acao_curso_exame OWNER TO postgres;

--
-- Name: acao_funcionarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.acao_funcionarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    acao_id uuid,
    funcionario_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.acao_funcionarios OWNER TO postgres;

--
-- Name: acoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.acoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instituicao_id uuid,
    tipo character varying(50) NOT NULL,
    municipio character varying(100) NOT NULL,
    estado character varying(2) NOT NULL,
    data_inicio date NOT NULL,
    data_fim date,
    status character varying(50) DEFAULT 'planejada'::character varying,
    descricao text,
    local_execucao character varying(255),
    vagas_disponiveis integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    numero_acao character varying(50),
    distancia_km numeric(10,2),
    preco_combustivel_referencia numeric(10,2),
    campos_customizados jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT acoes_status_check CHECK (((status)::text = ANY ((ARRAY['planejada'::character varying, 'ativa'::character varying, 'concluida'::character varying, 'cancelada'::character varying])::text[]))),
    CONSTRAINT acoes_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['curso'::character varying, 'saude'::character varying, 'outro'::character varying])::text[])))
);


ALTER TABLE public.acoes OWNER TO postgres;

--
-- Name: caminhoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caminhoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    placa character varying(10) NOT NULL,
    modelo character varying(255) NOT NULL,
    ano integer,
    capacidade_litros numeric(10,2),
    km_por_litro numeric(10,2),
    status character varying(50) DEFAULT 'disponivel'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    custo_diario numeric(10,2),
    capacidade_atendimento integer,
    autonomia_km_litro numeric(10,2),
    campos_customizados jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.caminhoes OWNER TO postgres;

--
-- Name: cidadaos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cidadaos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cpf character varying(255) NOT NULL,
    nome_completo character varying(255) NOT NULL,
    data_nascimento date NOT NULL,
    telefone character varying(20),
    email character varying(255) NOT NULL,
    senha character varying(255) NOT NULL,
    foto_url character varying(500),
    endereco jsonb,
    campos_customizados jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    municipio character varying(100),
    estado character varying(2),
    cep character varying(10),
    rua character varying(255),
    numero character varying(20),
    complemento character varying(100),
    bairro character varying(100),
    consentimento_lgpd boolean DEFAULT false,
    data_consentimento timestamp without time zone,
    ip_consentimento character varying(50),
    reset_password_token character varying(255),
    reset_password_expires timestamp without time zone,
    foto_perfil character varying(500),
    tipo character varying(20) DEFAULT 'cidadao'::character varying
);


ALTER TABLE public.cidadaos OWNER TO postgres;

--
-- Name: configuracoes_campo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracoes_campo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome_campo character varying(100) NOT NULL,
    label character varying(255) NOT NULL,
    tipo character varying(50) NOT NULL,
    obrigatorio boolean DEFAULT false,
    opcoes jsonb,
    ordem integer DEFAULT 0,
    ativo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.configuracoes_campo OWNER TO postgres;

--
-- Name: cursos_exames; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cursos_exames (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome character varying(255) NOT NULL,
    tipo character varying(50) NOT NULL,
    carga_horaria integer,
    descricao text,
    requisitos text,
    certificadora character varying(255),
    ativo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    campos_customizados jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT cursos_exames_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['curso'::character varying, 'exame'::character varying])::text[])))
);


ALTER TABLE public.cursos_exames OWNER TO postgres;

--
-- Name: funcionarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.funcionarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome character varying(255) NOT NULL,
    cargo character varying(100),
    especialidade character varying(100),
    custo_diario numeric(10,2),
    status character varying(50) DEFAULT 'ativo'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    campos_customizados jsonb DEFAULT '{}'::jsonb,
    cpf character varying(14),
    telefone character varying(20),
    email character varying(255)
);


ALTER TABLE public.funcionarios OWNER TO postgres;

--
-- Name: inscricoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inscricoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cidadao_id uuid,
    acao_id uuid,
    curso_exame_id uuid,
    status character varying(50) DEFAULT 'pendente'::character varying,
    data_inscricao timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    acao_curso_id uuid,
    data_confirmacao timestamp without time zone,
    data_atendimento timestamp without time zone,
    compareceu boolean DEFAULT false,
    cadastro_espontaneo boolean DEFAULT false,
    nota_final numeric(5,2),
    observacoes text,
    campos_customizados jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT inscricoes_status_check CHECK (((status)::text = ANY ((ARRAY['pendente'::character varying, 'atendido'::character varying, 'faltou'::character varying, 'cancelado'::character varying])::text[])))
);


ALTER TABLE public.inscricoes OWNER TO postgres;

--
-- Name: instituicoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instituicoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    razao_social character varying(255) NOT NULL,
    cnpj character varying(18) NOT NULL,
    telefone character varying(20),
    email character varying(255),
    municipio character varying(100),
    estado character varying(2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    campos_customizados jsonb DEFAULT '{}'::jsonb,
    responsavel_nome character varying(255),
    responsavel_cargo character varying(100),
    responsavel_telefone character varying(20),
    responsavel_email character varying(255),
    responsavel_tel character varying(20),
    endereco_completo text,
    ativo boolean DEFAULT true
);


ALTER TABLE public.instituicoes OWNER TO postgres;

--
-- Name: noticias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.noticias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo character varying(255) NOT NULL,
    conteudo text NOT NULL,
    imagem_url character varying(500),
    destaque boolean DEFAULT false,
    publicada boolean DEFAULT false,
    data_publicacao timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    acao_id uuid,
    campos_customizados jsonb DEFAULT '{}'::jsonb,
    ativo boolean DEFAULT true
);


ALTER TABLE public.noticias OWNER TO postgres;

--
-- Name: notificacoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificacoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cidadao_id uuid,
    titulo character varying(255) NOT NULL,
    mensagem text NOT NULL,
    tipo character varying(50) DEFAULT 'info'::character varying,
    lida boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notificacoes OWNER TO postgres;

--
-- Data for Name: abastecimentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.abastecimentos (id, acao_id, caminhao_id, data_abastecimento, litros, valor_total, created_at, updated_at, preco_por_litro, observacoes) FROM stdin;
\.


--
-- Data for Name: acao_caminhoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.acao_caminhoes (id, acao_id, caminhao_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: acao_curso_exame; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.acao_curso_exame (id, acao_id, curso_exame_id, vagas, horarios, campos_customizados) FROM stdin;
ac111111-1111-1111-1111-111111111111	a1111111-1111-1111-1111-111111111111	11111111-1111-1111-1111-111111111111	30	{"manha": "08:00-12:00", "tarde": "14:00-18:00"}	{}
ac222222-2222-2222-2222-222222222222	a1111111-1111-1111-1111-111111111111	22222222-2222-2222-2222-222222222222	30	{"manha": "08:00-12:00", "tarde": "14:00-18:00"}	{}
ac333333-3333-3333-3333-333333333333	a1111111-1111-1111-1111-111111111111	66666666-6666-6666-6666-666666666666	30	{"manha": "08:00-12:00"}	{}
ac444444-4444-4444-4444-444444444444	b2222222-2222-2222-2222-222222222222	66666666-6666-6666-6666-666666666666	80	{"manha": "07:00-12:00"}	{}
ac555555-5555-5555-5555-555555555555	b2222222-2222-2222-2222-222222222222	77777777-7777-7777-7777-777777777777	60	{"manha": "07:00-12:00"}	{}
ac666666-6666-6666-6666-666666666666	b2222222-2222-2222-2222-222222222222	88888888-8888-8888-8888-888888888888	60	{"manha": "07:00-12:00"}	{}
ac777777-7777-7777-7777-777777777777	c3333333-3333-3333-3333-333333333333	55555555-5555-5555-5555-555555555555	50	{"noite": "19:00-22:00"}	{}
ac888888-8888-8888-8888-888888888888	d4444444-4444-4444-4444-444444444444	99999999-9999-9999-9999-999999999999	150	{"manha": "07:00-12:00", "tarde": "13:00-17:00"}	{}
ac999999-9999-9999-9999-999999999999	e5555555-5555-5555-5555-555555555555	55555555-5555-5555-5555-555555555555	40	{"manha": "08:00-12:00"}	{}
\.


--
-- Data for Name: acao_funcionarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.acao_funcionarios (id, acao_id, funcionario_id, created_at, updated_at) FROM stdin;
f1111111-1111-1111-1111-111111111111	a1111111-1111-1111-1111-111111111111	11111111-1111-1111-1111-111111111111	2026-02-03 01:18:35.240266	2026-02-03 01:18:35.240266
f2222222-2222-2222-2222-222222222222	a1111111-1111-1111-1111-111111111111	33333333-3333-3333-3333-333333333333	2026-02-03 01:18:35.240266	2026-02-03 01:18:35.240266
f3333333-3333-3333-3333-333333333333	b2222222-2222-2222-2222-222222222222	22222222-2222-2222-2222-222222222222	2026-02-03 01:18:35.240266	2026-02-03 01:18:35.240266
f4444444-4444-4444-4444-444444444444	b2222222-2222-2222-2222-222222222222	44444444-4444-4444-4444-444444444444	2026-02-03 01:18:35.240266	2026-02-03 01:18:35.240266
f5555555-5555-5555-5555-555555555555	c3333333-3333-3333-3333-333333333333	55555555-5555-5555-5555-555555555555	2026-02-03 01:18:35.240266	2026-02-03 01:18:35.240266
f6666666-6666-6666-6666-666666666666	d4444444-4444-4444-4444-444444444444	22222222-2222-2222-2222-222222222222	2026-02-03 01:18:35.240266	2026-02-03 01:18:35.240266
f7777777-7777-7777-7777-777777777777	e5555555-5555-5555-5555-555555555555	33333333-3333-3333-3333-333333333333	2026-02-03 01:18:35.240266	2026-02-03 01:18:35.240266
\.


--
-- Data for Name: acoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.acoes (id, instituicao_id, tipo, municipio, estado, data_inicio, data_fim, status, descricao, local_execucao, vagas_disponiveis, created_at, updated_at, numero_acao, distancia_km, preco_combustivel_referencia, campos_customizados) FROM stdin;
a1111111-1111-1111-1111-111111111111	11111111-1111-1111-1111-111111111111	curso	São Luís	MA	2026-03-01	2026-03-15	planejada	Capacitação	Centro SENAI	40	2026-02-02 22:10:43.038107	2026-02-03 00:52:50.042	\N	100.00	6.00	{}
b2222222-2222-2222-2222-222222222222	22222222-2222-2222-2222-222222222222	saude	Imperatriz	MA	2026-03-10	2026-03-12	planejada	Campanha de Saúde Preventiva	Centro Comunitário Vila Nova	200	2026-02-03 01:16:59.83931	2026-02-03 01:16:59.83931	AC-2026-002	630.00	6.20	{}
c3333333-3333-3333-3333-333333333333	33333333-3333-3333-3333-333333333333	curso	Caxias	MA	2026-04-01	2026-04-30	planejada	Capacitação em Empreendedorismo	SEBRAE Caxias	50	2026-02-03 01:16:59.83931	2026-02-03 01:16:59.83931	AC-2026-003	360.00	6.10	{}
d4444444-4444-4444-4444-444444444444	44444444-4444-4444-4444-444444444444	saude	Caxias	MA	2026-03-20	2026-03-22	ativa	Mutirão de Saúde Bucal	Unidade Básica de Saúde Central	150	2026-02-03 01:16:59.83931	2026-02-03 01:16:59.83931	AC-2026-004	360.00	6.10	{}
e5555555-5555-5555-5555-555555555555	55555555-5555-5555-5555-555555555555	curso	São Luís	MA	2026-05-05	2026-06-30	planejada	Curso Técnico em Informática	IFMA Campus São Luís Centro	40	2026-02-03 01:16:59.83931	2026-02-03 01:16:59.83931	AC-2026-005	15.00	6.00	{}
\.


--
-- Data for Name: caminhoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caminhoes (id, placa, modelo, ano, capacidade_litros, km_por_litro, status, created_at, updated_at, custo_diario, capacidade_atendimento, autonomia_km_litro, campos_customizados) FROM stdin;
11111111-1111-1111-1111-111111111111	ABC-1234	Mercedes-Benz Atego	2020	300.00	3.50	disponivel	2026-02-02 22:10:43.054233	2026-02-03 01:06:42.605	\N	200	8.50	{}
22222222-2222-2222-2222-222222222222	DEF-5678	VW Delivery	2021	250.00	4.00	disponivel	2026-02-02 22:10:43.054233	2026-02-03 01:08:11.098	\N	100	8.50	{}
44444444-4444-4444-4444-444444444444	JKL-3456	Iveco Daily	2023	90.00	10.20	disponivel	2026-02-03 01:15:24.961258	2026-02-03 01:15:24.961258	280.00	20	10.20	{}
55555555-5555-5555-5555-555555555555	MNO-7890	Mercedes-Benz Sprinter	2021	75.00	11.50	em_manutencao	2026-02-03 01:15:24.961258	2026-02-03 01:15:24.961258	320.00	15	11.50	{}
33333333-3333-3333-3333-333333333333	GHI-9012	Ford Cargo 816	2022	120.00	8.50	disponivel	2026-02-03 01:15:24.961258	2026-02-03 01:30:30.125	350.00	25	8.50	{}
\.


--
-- Data for Name: cidadaos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cidadaos (id, cpf, nome_completo, data_nascimento, telefone, email, senha, foto_url, endereco, campos_customizados, created_at, updated_at, municipio, estado, cep, rua, numero, complemento, bairro, consentimento_lgpd, data_consentimento, ip_consentimento, reset_password_token, reset_password_expires, foto_perfil, tipo) FROM stdin;
c1111111-1111-1111-1111-111111111111	79ef0ce86dfa64903d0891eda1fda196:fc2883eada89f0405da50d4aa486fc00:5a467c74001f7a776dabcc	Ana Carolina Ferreira	1995-03-15	(98) 98111-1111	ana.ferreira@email.com	\\$2b\\$10\\$abcdefghijklmnopqrstuvwxyz123456	\N	\N	{}	2026-02-03 01:15:25.093329	2026-02-03 01:29:51.4	São Luís	MA	65000-000	Rua do Sol	123	\N	Centro	t	\N	\N	\N	\N	\N	cidadao
c2222222-2222-2222-2222-222222222222	545d1efeba164f02426bb7da2569aac4:52b9ec45168cc4bca0d023ce045410d3:6395315d38f1d0fa5f9c04	Bruno Santos Oliveira	1988-07-22	(98) 98222-2222	bruno.oliveira@email.com	\\$2b\\$10\\$abcdefghijklmnopqrstuvwxyz123456	\N	\N	{}	2026-02-03 01:15:25.093329	2026-02-03 01:29:51.442	Imperatriz	MA	65900-000	Av. Getúlio Vargas	456	\N	Nova Imperatriz	t	\N	\N	\N	\N	\N	cidadao
c3333333-3333-3333-3333-333333333333	fb265782f15b69d11533bceaabe895be:c539f26052b99e0998d9450ee178904e:c5e091288defa519ca257a	Carla Mendes Silva	1992-11-08	(98) 98333-3333	carla.silva@email.com	\\$2b\\$10\\$abcdefghijklmnopqrstuvwxyz123456	\N	\N	{}	2026-02-03 01:15:25.093329	2026-02-03 01:29:51.49	Caxias	MA	65600-000	Rua Grande	789	\N	Trizidela	t	\N	\N	\N	\N	\N	cidadao
c4444444-4444-4444-4444-444444444444	8e63ae9845013161f451ce27347a24f6:b6039f6607fdc0e36f8c820eda621f0e:4cd46b6116d1d15dbc53fb	Daniel Costa Lima	1990-05-30	(98) 98444-4444	daniel.lima@email.com	\\$2b\\$10\\$abcdefghijklmnopqrstuvwxyz123456	\N	\N	{}	2026-02-03 01:15:25.093329	2026-02-03 01:29:51.507	São Luís	MA	65010-000	Rua da Paz	321	\N	Renascença	t	\N	\N	\N	\N	\N	cidadao
c5555555-5555-5555-5555-555555555555	2b47c2b8c7880fc07fc8094381a77848:ba238595f7aca5dc4f43a999f6a86fe6:d0aad6ebf8fe9ccb6e7ec7	Eduarda Alves Santos	1997-09-12	(98) 98555-5555	eduarda.santos@email.com	\\$2b\\$10\\$abcdefghijklmnopqrstuvwxyz123456	\N	\N	{}	2026-02-03 01:15:25.093329	2026-02-03 01:29:51.548	Imperatriz	MA	65910-000	Rua das Flores	654	\N	Bacuri	t	\N	\N	\N	\N	\N	cidadao
c6666666-6666-6666-6666-666666666666	13c1bd9c22cc4b76c088d7f62f430d20:f02b1cc5feb05833dc260843f164df93:1f57b208a6572a69fc1463	Felipe Rodrigues Costa	1985-12-25	(98) 98666-6666	felipe.costa@email.com	\\$2b\\$10\\$abcdefghijklmnopqrstuvwxyz123456	\N	\N	{}	2026-02-03 01:15:25.093329	2026-02-03 01:29:51.57	Caxias	MA	65610-000	Av. Presidente Vargas	987	\N	Centro	t	\N	\N	\N	\N	\N	cidadao
c7777777-7777-7777-7777-777777777777	0084fe76d6eb7484e0174266e2159252:eaa547fccb852ed974c6697a161e2095:4f86b2e32883f54b98028c	Gabriela Souza Dias	1994-02-18	(98) 98777-7777	gabriela.dias@email.com	\\$2b\\$10\\$abcdefghijklmnopqrstuvwxyz123456	\N	\N	{}	2026-02-03 01:15:25.093329	2026-02-03 01:29:51.619	São Luís	MA	65020-000	Rua do Comércio	147	\N	Cohab	t	\N	\N	\N	\N	\N	cidadao
c8888888-8888-8888-8888-888888888888	599c765a67dda5b3f34fa1a8edfd30d2:04fbf54e7c75f9c4538dac9a128ea434:8ab2201489740a2e83c55c	Henrique Pereira Alves	1991-06-07	(98) 98888-8888	henrique.alves@email.com	\\$2b\\$10\\$abcdefghijklmnopqrstuvwxyz123456	\N	\N	{}	2026-02-03 01:15:25.093329	2026-02-03 01:29:51.639	Imperatriz	MA	65920-000	Rua Santa Teresa	258	\N	Juçara	t	\N	\N	\N	\N	\N	cidadao
c9999999-9999-9999-9999-999999999999	c152460ae03f6552f8fc14388cc9abd6:b8c1eaea2f8bf5f54a818e10d877cf7c:cfe70c218a09744168fa72	Isabela Martins Rocha	1996-10-14	(98) 98999-9999	isabela.rocha@email.com	\\$2b\\$10\\$abcdefghijklmnopqrstuvwxyz123456	\N	\N	{}	2026-02-03 01:15:25.093329	2026-02-03 01:29:51.68	Caxias	MA	65620-000	Rua São José	369	\N	Ponte	t	\N	\N	\N	\N	\N	cidadao
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	9f84b67f3b3bca1916cd2a7cf551f0d7:59e11a8d03aab9803f80bc7633eed9ca:683f9926a57566ce62856a	Administrador do Sistema	1990-01-01	null	admin@sistemacarretas.com.br	$2b$10$dudRch1W/LFpl00Z5JGKPu5KSweEkx21Oz20EC2ah9DUoxM3bTrUe	\N	\N	{}	2026-02-03 01:25:07.843679	2026-02-03 01:43:09.997	\N	\N	\N	\N	\N		\N	t	\N	\N	\N	\N	/uploads/perfil/admin-1770082989827-561975281.jpg	admin
\.


--
-- Data for Name: configuracoes_campo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracoes_campo (id, nome_campo, label, tipo, obrigatorio, opcoes, ordem, ativo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cursos_exames; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cursos_exames (id, nome, tipo, carga_horaria, descricao, requisitos, certificadora, ativo, created_at, updated_at, campos_customizados) FROM stdin;
11111111-1111-1111-1111-111111111111	Eletricista Industrial	curso	160	Formação completa em instalações elétricas industriais	Ensino fundamental completo	SENAI	t	2026-02-03 01:15:25.050669	2026-02-03 01:15:25.050669	{}
22222222-2222-2222-2222-222222222222	Mecânico de Automóveis	curso	200	Manutenção preventiva e corretiva de veículos	Ensino fundamental completo	SENAI	t	2026-02-03 01:15:25.050669	2026-02-03 01:15:25.050669	{}
33333333-3333-3333-3333-333333333333	Soldador	curso	120	Técnicas de soldagem MIG, TIG e eletrodo revestido	Ensino fundamental completo	SENAI	t	2026-02-03 01:15:25.050669	2026-02-03 01:15:25.050669	{}
44444444-4444-4444-4444-444444444444	Operador de Empilhadeira	curso	40	Operação segura de empilhadeiras e equipamentos de movimentação	CNH categoria B	SESI	t	2026-02-03 01:15:25.050669	2026-02-03 01:15:25.050669	{}
55555555-5555-5555-5555-555555555555	Informática Básica	curso	60	Introdução à informática, Windows e pacote Office	Alfabetizado	SEBRAE	t	2026-02-03 01:15:25.050669	2026-02-03 01:15:25.050669	{}
66666666-6666-6666-6666-666666666666	Exame de Vista	exame	1	Avaliação oftalmológica completa	Nenhum	Clínica Oftalmológica	t	2026-02-03 01:15:25.083371	2026-02-03 01:15:25.083371	{}
77777777-7777-7777-7777-777777777777	Exame de Sangue Completo	exame	1	Hemograma completo e bioquímica	Jejum de 8 horas	Laboratório Central	t	2026-02-03 01:15:25.083371	2026-02-03 01:15:25.083371	{}
88888888-8888-8888-8888-888888888888	Exame de Diabetes	exame	1	Glicemia em jejum e hemoglobina glicada	Jejum de 8 horas	Laboratório Central	t	2026-02-03 01:15:25.083371	2026-02-03 01:15:25.083371	{}
99999999-9999-9999-9999-999999999999	Exame de Pressão Arterial	exame	1	Aferição de pressão arterial	Nenhum	Posto de Saúde	t	2026-02-03 01:15:25.083371	2026-02-03 01:15:25.083371	{}
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	Exame Cardiológico	exame	2	Eletrocardiograma e avaliação cardiológica	Nenhum	Hospital Regional	t	2026-02-03 01:15:25.083371	2026-02-03 01:15:25.083371	{}
\.


--
-- Data for Name: funcionarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.funcionarios (id, nome, cargo, especialidade, custo_diario, status, created_at, updated_at, campos_customizados, cpf, telefone, email) FROM stdin;
11111111-1111-1111-1111-111111111111	Carlos Eduardo Silva	Motorista	Categoria D	180.00	ativo	2026-02-03 01:18:06.590404	2026-02-03 01:18:06.590404	{}	12345678901	(98) 98765-1111	carlos.silva@carretas.ma.gov.br
22222222-2222-2222-2222-222222222222	Fernanda Souza Lima	Enfermeira	Saúde da Família	250.00	ativo	2026-02-03 01:18:06.590404	2026-02-03 01:18:06.590404	{}	23456789012	(98) 98765-2222	fernanda.lima@carretas.ma.gov.br
33333333-3333-3333-3333-333333333333	José Roberto Santos	Instrutor	Eletricista Industrial	220.00	ativo	2026-02-03 01:18:06.590404	2026-02-03 01:18:06.590404	{}	34567890123	(98) 98765-3333	jose.santos@carretas.ma.gov.br
44444444-4444-4444-4444-444444444444	Mariana Costa Alves	Médico	Clínico Geral	400.00	ativo	2026-02-03 01:18:06.590404	2026-02-03 01:18:06.590404	{}	45678901234	(98) 98765-4444	mariana.alves@carretas.ma.gov.br
55555555-5555-5555-5555-555555555555	Paulo Henrique Dias	Coordenador	Gestão de Projetos	300.00	ativo	2026-02-03 01:18:06.590404	2026-02-03 01:18:06.590404	{}	56789012345	(98) 98765-5555	paulo.dias@carretas.ma.gov.br
\.


--
-- Data for Name: inscricoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inscricoes (id, cidadao_id, acao_id, curso_exame_id, status, data_inscricao, created_at, updated_at, acao_curso_id, data_confirmacao, data_atendimento, compareceu, cadastro_espontaneo, nota_final, observacoes, campos_customizados) FROM stdin;
93276b24-00ae-4580-a56e-b10d41858fec	c1111111-1111-1111-1111-111111111111	\N	\N	pendente	2026-02-03 01:30:04.697	2026-02-03 01:30:04.697	2026-02-03 01:31:10.504	ac111111-1111-1111-1111-111111111111	\N	2026-02-03 01:30:50.461	t	f	\N	\N	{}
\.


--
-- Data for Name: instituicoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instituicoes (id, razao_social, cnpj, telefone, email, municipio, estado, created_at, updated_at, campos_customizados, responsavel_nome, responsavel_cargo, responsavel_telefone, responsavel_email, responsavel_tel, endereco_completo, ativo) FROM stdin;
11111111-1111-1111-1111-111111111111	SENAI	03.775.428/0001-40	(11) 3528-2000	contato@senai.br	São Paulo	SP	2026-02-02 22:10:42.95406	2026-02-02 22:10:42.95406	{}	\N	\N	\N	\N	\N	\N	t
22222222-2222-2222-2222-222222222222	SESI - Serviço Social da Indústria	03.775.428/0002-51	(98) 3214-5678	contato@sesi-ma.org.br	São Luís	MA	2026-02-03 01:15:24.867872	2026-02-03 01:15:24.867872	{}	Maria Silva Santos	Coordenadora	\N	maria.santos@sesi-ma.org.br	(98) 98765-4321	\N	t
33333333-3333-3333-3333-333333333333	SEBRAE Maranhão	00.000.000/0001-91	(98) 3235-1234	atendimento@sebrae-ma.com.br	Imperatriz	MA	2026-02-03 01:15:24.867872	2026-02-03 01:15:24.867872	{}	João Carlos Oliveira	Gerente Regional	\N	joao.oliveira@sebrae-ma.com.br	(99) 99876-5432	\N	t
44444444-4444-4444-4444-444444444444	Prefeitura Municipal de Caxias	06.138.421/0001-44	(99) 3521-3456	saude@caxias.ma.gov.br	Caxias	MA	2026-02-03 01:15:24.867872	2026-02-03 01:15:24.867872	{}	Ana Paula Costa	Secretária de Saúde	\N	ana.costa@caxias.ma.gov.br	(99) 99123-4567	\N	t
55555555-5555-5555-5555-555555555555	Instituto Federal do Maranhão - IFMA	10.735.145/0001-98	(98) 3218-9000	reitoria@ifma.edu.br	São Luís	MA	2026-02-03 01:15:24.867872	2026-02-03 01:15:24.867872	{}	Dr. Roberto Ferreira Lima	Reitor	\N	roberto.lima@ifma.edu.br	(98) 98234-5678	\N	t
\.


--
-- Data for Name: noticias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.noticias (id, titulo, conteudo, imagem_url, destaque, publicada, data_publicacao, created_at, updated_at, acao_id, campos_customizados, ativo) FROM stdin;
\.


--
-- Data for Name: notificacoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificacoes (id, cidadao_id, titulo, mensagem, tipo, lida, created_at, updated_at) FROM stdin;
\.


--
-- Name: abastecimentos abastecimentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.abastecimentos
    ADD CONSTRAINT abastecimentos_pkey PRIMARY KEY (id);


--
-- Name: acao_caminhoes acao_caminhoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acao_caminhoes
    ADD CONSTRAINT acao_caminhoes_pkey PRIMARY KEY (id);


--
-- Name: acao_curso_exame acao_curso_exame_acao_id_curso_exame_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acao_curso_exame
    ADD CONSTRAINT acao_curso_exame_acao_id_curso_exame_id_key UNIQUE (acao_id, curso_exame_id);


--
-- Name: acao_curso_exame acao_curso_exame_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acao_curso_exame
    ADD CONSTRAINT acao_curso_exame_pkey PRIMARY KEY (id);


--
-- Name: acao_funcionarios acao_funcionarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acao_funcionarios
    ADD CONSTRAINT acao_funcionarios_pkey PRIMARY KEY (id);


--
-- Name: acoes acoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acoes
    ADD CONSTRAINT acoes_pkey PRIMARY KEY (id);


--
-- Name: caminhoes caminhoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caminhoes
    ADD CONSTRAINT caminhoes_pkey PRIMARY KEY (id);


--
-- Name: caminhoes caminhoes_placa_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caminhoes
    ADD CONSTRAINT caminhoes_placa_key UNIQUE (placa);


--
-- Name: cidadaos cidadaos_cpf_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cidadaos
    ADD CONSTRAINT cidadaos_cpf_key UNIQUE (cpf);


--
-- Name: cidadaos cidadaos_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cidadaos
    ADD CONSTRAINT cidadaos_email_key UNIQUE (email);


--
-- Name: cidadaos cidadaos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cidadaos
    ADD CONSTRAINT cidadaos_pkey PRIMARY KEY (id);


--
-- Name: configuracoes_campo configuracoes_campo_nome_campo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracoes_campo
    ADD CONSTRAINT configuracoes_campo_nome_campo_key UNIQUE (nome_campo);


--
-- Name: configuracoes_campo configuracoes_campo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracoes_campo
    ADD CONSTRAINT configuracoes_campo_pkey PRIMARY KEY (id);


--
-- Name: cursos_exames cursos_exames_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos_exames
    ADD CONSTRAINT cursos_exames_pkey PRIMARY KEY (id);


--
-- Name: funcionarios funcionarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT funcionarios_pkey PRIMARY KEY (id);


--
-- Name: inscricoes inscricoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscricoes
    ADD CONSTRAINT inscricoes_pkey PRIMARY KEY (id);


--
-- Name: instituicoes instituicoes_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instituicoes
    ADD CONSTRAINT instituicoes_cnpj_key UNIQUE (cnpj);


--
-- Name: instituicoes instituicoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instituicoes
    ADD CONSTRAINT instituicoes_pkey PRIMARY KEY (id);


--
-- Name: noticias noticias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT noticias_pkey PRIMARY KEY (id);


--
-- Name: notificacoes notificacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT notificacoes_pkey PRIMARY KEY (id);


--
-- Name: abastecimentos abastecimentos_acao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.abastecimentos
    ADD CONSTRAINT abastecimentos_acao_id_fkey FOREIGN KEY (acao_id) REFERENCES public.acoes(id) ON DELETE CASCADE;


--
-- Name: abastecimentos abastecimentos_caminhao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.abastecimentos
    ADD CONSTRAINT abastecimentos_caminhao_id_fkey FOREIGN KEY (caminhao_id) REFERENCES public.caminhoes(id) ON DELETE CASCADE;


--
-- Name: acao_caminhoes acao_caminhoes_acao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acao_caminhoes
    ADD CONSTRAINT acao_caminhoes_acao_id_fkey FOREIGN KEY (acao_id) REFERENCES public.acoes(id) ON DELETE CASCADE;


--
-- Name: acao_caminhoes acao_caminhoes_caminhao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acao_caminhoes
    ADD CONSTRAINT acao_caminhoes_caminhao_id_fkey FOREIGN KEY (caminhao_id) REFERENCES public.caminhoes(id) ON DELETE CASCADE;


--
-- Name: acao_curso_exame acao_curso_exame_acao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acao_curso_exame
    ADD CONSTRAINT acao_curso_exame_acao_id_fkey FOREIGN KEY (acao_id) REFERENCES public.acoes(id) ON DELETE CASCADE;


--
-- Name: acao_curso_exame acao_curso_exame_curso_exame_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acao_curso_exame
    ADD CONSTRAINT acao_curso_exame_curso_exame_id_fkey FOREIGN KEY (curso_exame_id) REFERENCES public.cursos_exames(id) ON DELETE CASCADE;


--
-- Name: acao_funcionarios acao_funcionarios_acao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acao_funcionarios
    ADD CONSTRAINT acao_funcionarios_acao_id_fkey FOREIGN KEY (acao_id) REFERENCES public.acoes(id) ON DELETE CASCADE;


--
-- Name: acao_funcionarios acao_funcionarios_funcionario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acao_funcionarios
    ADD CONSTRAINT acao_funcionarios_funcionario_id_fkey FOREIGN KEY (funcionario_id) REFERENCES public.funcionarios(id) ON DELETE CASCADE;


--
-- Name: acoes acoes_instituicao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acoes
    ADD CONSTRAINT acoes_instituicao_id_fkey FOREIGN KEY (instituicao_id) REFERENCES public.instituicoes(id) ON DELETE SET NULL;


--
-- Name: inscricoes fk_inscricoes_acao_curso; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscricoes
    ADD CONSTRAINT fk_inscricoes_acao_curso FOREIGN KEY (acao_curso_id) REFERENCES public.acao_curso_exame(id) ON DELETE CASCADE;


--
-- Name: inscricoes inscricoes_acao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscricoes
    ADD CONSTRAINT inscricoes_acao_id_fkey FOREIGN KEY (acao_id) REFERENCES public.acoes(id) ON DELETE CASCADE;


--
-- Name: inscricoes inscricoes_cidadao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscricoes
    ADD CONSTRAINT inscricoes_cidadao_id_fkey FOREIGN KEY (cidadao_id) REFERENCES public.cidadaos(id) ON DELETE CASCADE;


--
-- Name: inscricoes inscricoes_curso_exame_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscricoes
    ADD CONSTRAINT inscricoes_curso_exame_id_fkey FOREIGN KEY (curso_exame_id) REFERENCES public.cursos_exames(id) ON DELETE SET NULL;


--
-- Name: notificacoes notificacoes_cidadao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT notificacoes_cidadao_id_fkey FOREIGN KEY (cidadao_id) REFERENCES public.cidadaos(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict m0CjgMLs9DsAokDLQoREXX6pqGx2wKB8sNd1RWBpIhfqsgBk9hbU3O3IQiMYjWZ

