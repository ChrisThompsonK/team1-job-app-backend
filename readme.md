# Job Application Backend API

[![Code Quality Checks](https://github.com/ChrisThompsonK/team1-job-app-backend/actions/workflows/biome.yml/badge.svg)](https://github.com/ChrisThompsonK/team1-job-app-backend/actions/workflows/biome.yml)

A modern, type-safe Node.js backend API for managing job applications. Built with Express, TypeScript, and Drizzle ORM.

## 🚀 Features

- **Modern TypeScript**: Fully typed with ES modules
- **Express.js**: Fast and minimal web framework
- **Drizzle ORM**: Type-safe database operations with SQLite
- **Advanced Filtering**: Server-side filtering with pagination and sorting
- **Dependency Injection**: Clean architecture with IoC container
- **Testing**: Comprehensive unit tests with Vitest
- **Code Quality**: Biome for linting and formatting
- **CORS Support**: Configurable cross-origin resource sharing
- **Error Handling**: Centralized error handling middleware

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/ChrisThompsonK/team1-job-app-backend.git
cd team1-job-app-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=file:./jobApp.db
CORS_ORIGIN=http://localhost:3001
```

4. Set up the database:
```bash
npm run db:setup
```

This will run migrations and seed the database with initial data.

## 🏃 Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in your `.env` file).

## 🧪 Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

```

## 🔍 Code Quality

This project uses **Biome** for linting and formatting:

```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check formatting
npm run format:check

# Fix formatting
npm run format

# Run all checks (lint + format)
npm run check

# Fix all issues
npm run check:fix
```

## 📚 API Endpoints

### Base URL
```
http://localhost:3000
```

### Endpoints

#### Get Welcome Message
```
GET /
```

#### Get All Jobs
```
GET /api/jobs
```

#### Get Job by ID
```
GET /api/jobs/:id
```

#### Search & Filter Jobs
```
GET /api/jobs/search
```

**Query Parameters:**
- `capability` - Filter by capability (DATA, WORKDAY, ENGINEERING, PRODUCT, DESIGN, PLATFORM, QUALITY, ARCHITECTURE, BUSINESS_ANALYSIS, SECURITY)
- `band` - Filter by band (Junior, Mid, Senior, Principal)
- `location` - Filter by location (partial match)
- `status` - Filter by status (open, closed)
- `search` - Text search across job title, description, and responsibilities
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (1-100, default: 10)
- `sortBy` - Sort field (jobRoleName, closingDate, band, capability, location)
- `sortOrder` - Sort direction (asc, desc, default: asc)

**Examples:**
```bash
# Filter by capability and band
GET /api/jobs/search?capability=DATA&band=SENIOR

# Search with sorting
GET /api/jobs/search?search=engineer&sortBy=closingDate&sortOrder=desc

# Paginated results
GET /api/jobs/search?location=London&page=1&limit=5
```

#### Create Job
```
POST /api/jobs
Content-Type: application/json

{
  "jobRoleName": "Senior Software Engineer",
  "description": "We are looking for...",
  "responsibilities": "You will be responsible for...",
  "capability": "ENGINEERING",
  "band": "Senior",
  "closingDate": "2025-12-31",
  "location": "London",
  "status": "open"
}
```

#### Update Job
```
PUT /api/jobs/:id
Content-Type: application/json

{
  "status": "closed"
}
```

#### Delete Job
```
DELETE /api/jobs/:id
```

## 🗄️ Database Management

### Generate Migrations
```bash
npm run db:generate
```

### Run Migrations
```bash
npm run db:migrate
```

### Seed Database
```bash
npm run db:seed
```

### Setup Database (Migrate + Seed)
```bash
npm run db:setup
```

## 📁 Project Structure

```
src/
├── app.ts                    # Express application setup
├── server.ts                 # Server entry point
├── config/
│   └── env.ts               # Environment configuration
├── controllers/
│   └── JobController.ts     # Request handlers
├── db/
│   ├── migrate.ts           # Migration runner
│   ├── schemas.ts           # Database schemas
│   └── seeds/               # Database seed files
├── di/
│   └── container.ts         # Dependency injection
├── middleware/
│   ├── errorHandler.ts      # Error handling
│   └── middlewareConfig.ts  # Middleware setup
├── models/
│   └── JobModel.ts          # Data models
├── repositories/
│   └── JobRepository.ts     # Data access layer
├── routes/
│   └── CreateJobRoutes.ts   # API routes
├── services/
│   └── JobService.ts        # Business logic
├── utils/
│   └── QueryParameterParser.ts  # Query parsing utilities
└── validators/
    └── JobValidator.ts      # Input validation
```

## 🏗️ Architecture

The application follows a **layered architecture** with dependency injection:

1. **Routes** → Define API endpoints
2. **Controllers** → Handle HTTP requests/responses
3. **Services** → Implement business logic
4. **Repositories** → Manage data access
5. **Models** → Define data structures

This separation ensures:
- **Testability**: Each layer can be tested in isolation
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to extend and modify

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment (development/production/test) | development | Yes |
| `DATABASE_URL` | SQLite database path | file:./jobApp.db | Yes |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3001 | Yes |

## 🤝 Contributing

1. Follow the Biome configuration in `biome.json`
2. Write tests for new features
3. Ensure all tests pass: `npm test`
4. Run linting: `npm run lint`
5. Format code: `npm run format`

## 📝 License

MIT

## 👥 Authors

Team 1 - EAYL Training Project
