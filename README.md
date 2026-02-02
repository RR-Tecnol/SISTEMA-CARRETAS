# Sistema Carretas

Plataforma completa para gestão de ações educacionais e de saúde em unidades móveis (carretas).

## 📋 Funcionalidades

### Portal do Cidadão
- 🔐 Cadastro com termo de consentimento LGPD
- 🔍 Busca de ações educacionais e de saúde
- ✍️ Inscrição em cursos e exames
- 📱 Acompanhamento de inscrições
- 📜 Download de certificados
- 🔔 Notificações via WhatsApp

### Painel Administrativo
- 🏢 Gestão de instituições contratantes
- 📚 Catálogo de cursos e exames
- 📅 Criação e gestão de ações
- 👥 Gerenciamento de cidadãos
- ✅ Controle de presença e aproveitamento
- 📢 Campanhas de notificações WhatsApp
- 📰 Publicação de notícias
- ⚙️ Configuração de campos dinâmicos
- 🚛 Gestão de Caminhões (Unidades Móveis)
- 👨‍⚕️ Gestão de Funcionários e Equipe Técnica
- 📊 Relatórios Gerenciais e Business Intelligence (BI)
- 💰 Cálculo de Custo Passivo e Custo por Pessoa Atendida

## 🛠️ Tecnologias

### Backend
- Node.js 18+ com TypeScript
- Express.js
- Sequelize ORM
- PostgreSQL 15+
- Redis (cache e filas)
- Bull (processamento de WhatsApp)
- JWT Authentication

### Frontend
- React 18 com TypeScript
- Material-UI (MUI)
- Redux Toolkit
- React Router v6
- React Hook Form

### Infraestrutura
- Docker & Docker Compose
- PostgreSQL
- Redis
- MinIO (storage S3-compatible)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Git

### 1. Clone o repositório
```bash
git clone <repository-url>
cd sistema-carretas
```

### 2. Configure as variáveis de ambiente

**Backend:**
```bash
cd backend
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Inicie os serviços com Docker

```bash
# Na raiz do projeto
docker-compose up -d
```

Isso irá iniciar:
- PostgreSQL na porta 5432
- Redis na porta 6379
- MinIO na porta 9000 (API) e 9001 (Console)

### 4. Instale as dependências

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 5. Execute as migrations do banco

```bash
cd backend
npm run migrate
```

### 6. (Opcional) Popule o banco com dados de teste

```bash
cd backend
npm run seed
```

### 7. Inicie os servidores de desenvolvimento

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
Backend rodará em: http://localhost:3001

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```
Frontend rodará em: http://localhost:3000

## 📁 Estrutura do Projeto

```
sistema-carretas/
├── backend/               # API REST
│   ├── src/
│   │   ├── config/       # Configurações
│   │   ├── models/       # Models Sequelize
│   │   ├── controllers/  # Controllers
│   │   ├── services/     # Lógica de negócio
│   │   ├── routes/       # Rotas da API
│   │   ├── middlewares/  # Middlewares
│   │   ├── utils/        # Utilidades
│   │   └── queues/       # Filas Bull
│   ├── migrations/       # Migrations DB
│   └── seeders/         # Seeds
│
├── frontend/             # Aplicação React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas
│   │   ├── store/       # Redux store
│   │   ├── services/    # API calls
│   │   └── utils/       # Utilidades
│
└── docker-compose.yml   # Orquestração de containers
```

## 🔒 Segurança e LGPD

- ✅ Criptografia de dados sensíveis (CPF)
- ✅ Termo de consentimento obrigatório
- ✅ Registro de IP e timestamp do consentimento
- ✅ Autenticação JWT
- ✅ Rate limiting
- ✅ Validação de inputs
- ✅ Headers de segurança (Helmet)

## 📊 Banco de Dados

### Principais Entidades
- **instituicoes** - Instituições contratantes
- **cursos_exames** - Catálogo de cursos e exames
- **acoes** - Eventos em municípios
- **acao_curso_exame** - Vinculação N:N
- **cidadaos** - Cadastro de cidadãos (com LGPD)
- **inscricoes** - Inscrições dos cidadãos
- **notificacoes** - Campanhas WhatsApp
- **noticias** - Conteúdo informativo
- **configuracoes_campo** - Campos dinâmicos
- **caminhoes** - Cadastro de unidades móveis
- **funcionarios** - Cadastro de equipe técnica
- **acao_caminhoes** - Vinculação de carretas às ações
- **acao_funcionarios** - Vinculação de equipe às ações

Todos os modelos possuem campo `campos_customizados` (JSONB) para flexibilidade.

## 🔗 API Endpoints

Documentação completa disponível em: http://localhost:3001/api-docs (Swagger)

### Principais rotas:
- `POST /api/auth/login` - Autenticação
- `POST /api/cidadaos/cadastro` - Cadastro de cidadão
- `GET /api/acoes` - Listar ações disponíveis
- `POST /api/inscricoes` - Realizar inscrição
- `GET /api/noticias` - Listar notícias

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 Scripts Disponíveis

### Backend
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Servidor de produção
- `npm run migrate` - Executar migrations
- `npm run seed` - Executar seeds
- `npm test` - Executar testes

### Frontend
- `npm start` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm test` - Executar testes

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através de:
- Email: suporte@sistemacarretas.com.br
- Telefone: (XX) XXXX-XXXX

## 📄 Licença

Este projeto é proprietário e confidencial.
