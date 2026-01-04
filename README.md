# TJournal - Trading Journal

📈 A modern, full-stack trading journal application for tracking and analyzing your trades.

## 🚀 Quick Start

**New here?** Check out the [QUICKSTART.md](QUICKSTART.md) guide to get up and running in 5 minutes!

## Project Status

✅ **Phase 1 Complete: Frontend Integration**

- ✅ **Backend:** Phoenix/Elixir with PostgreSQL
- ✅ **Frontend:** React 18 with full CRUD functionality
- ✅ **API Integration:** Complete REST API integration
- ✅ **Statistics Dashboard:** Real-time P&L tracking
- ❌ **Legacy Backends:** Flask (`backend/`) and Strapi (`backend-2/`) - to be removed

## Features

- ✅ **CRUD Operations** - Create, Read, Update, Delete trades
- ✅ **Multi-Asset Support** - Stocks, Crypto, Options, Certificates
- ✅ **P&L Calculation** - Automatic profit/loss calculation
- ✅ **Statistics Dashboard** - Win rate, total P&L, average P&L
- ✅ **Long/Short Tracking** - Support for both position types
- ✅ **Real-time Updates** - Dashboard updates after each action
- ✅ **Responsive Design** - Works on desktop and mobile
- 🔄 **CSV Import/Export** - Coming soon
- 🔄 **Advanced Filtering** - Coming soon
- 🔄 **Charts & Visualizations** - Coming soon

## Tech Stack

### Backend (Phoenix)

- **Language:** Elixir 1.16+
- **Framework:** Phoenix 1.7
- **Database:** PostgreSQL 16
- **API:** RESTful JSON API
- **Features:** CORS, LiveDashboard, Telemetry
- **Testing:** ExUnit
- **Linting:** Credo

### Frontend (React)

- **Framework:** React 18.3.1
- **HTTP Client:** Axios
- **Styling:** CSS Modules
- **State Management:** React Hooks
- **Build Tool:** Create React App

### Infrastructure

- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Version Control:** Git

## Quick Start

### Option 1: Manual Setup

```bash
# 1. Clone repository
git clone https://github.com/solaar45/tjournal.git
cd tjournal
git checkout feature/phoenix-backend

# 2. Start Backend
cd backend_phoenix
mix deps.get
mix ecto.setup
mix phx.server

# 3. Start Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm start
```

### Option 2: Docker Setup

```bash
cd backend_phoenix
docker-compose up -d

# Frontend still needs to run locally
cd ../frontend
npm install
npm start
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- LiveDashboard: http://localhost:4000/dashboard

## API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trades` | List all trades |
| GET | `/api/trades/:id` | Get single trade |
| POST | `/api/trades` | Create new trade |
| PUT | `/api/trades/:id` | Update trade |
| DELETE | `/api/trades/:id` | Delete trade |
| GET | `/api/trades/statistics` | Get statistics |

### Example Trade Object

```json
{
  "id": 1,
  "symbol": "AAPL",
  "type": "Aktie",
  "status": "open",
  "shares": 100,
  "side": "Long",
  "entrydate": "2024-01-15",
  "entryprice": "150.00",
  "exitdate": null,
  "exitprice": null,
  "notes": "Long term investment",
  "inserted_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Statistics Response

```json
{
  "total_trades": 10,
  "winning_trades": 6,
  "losing_trades": 4,
  "total_pnl": 1250.50,
  "avg_pnl": 125.05
}
```

## Development

### Prerequisites

- Elixir 1.14+ and Erlang/OTP 25+
- PostgreSQL 14+
- Node.js 18+ and npm
- Docker & Docker Compose (optional)

### Running Tests

```bash
# Backend tests
cd backend_phoenix
mix test
mix test --cover  # With coverage

# Frontend tests
cd frontend
npm test
npm test -- --coverage  # With coverage
```

### Code Quality

```bash
# Backend
cd backend_phoenix
mix format              # Format code
mix format --check-formatted  # Check formatting
mix credo               # Linting
mix credo --strict      # Strict linting

# Frontend
cd frontend
npm run lint            # ESLint
```

## Project Structure

```
tjournal/
├── backend_phoenix/       # ✅ Phoenix/Elixir Backend
│   ├── lib/
│   │   ├── tjournal/       # Business logic & contexts
│   │   └── tjournal_web/   # Controllers, views, router
│   ├── priv/repo/       # Migrations & seeds
│   ├── test/            # Tests
│   ├── config/          # Configuration
│   └── docker-compose.yml
├── frontend/             # ✅ React Frontend
│   ├── src/
│   │   ├── api/         # API service layer
│   │   ├── components/  # React components
│   │   ├── App.js       # Main app component
│   │   └── App.css      # Styles
│   ├── public/
│   └── package.json
├── backend/              # ❌ Deprecated Flask
├── backend-2/            # ❌ Deprecated Strapi
├── QUICKSTART.md         # Quick start guide
├── CHANGELOG.md          # Change log
└── README.md             # This file
```

## Why Phoenix?

The migration from Flask/Strapi to Phoenix/Elixir brings significant advantages:

1. **⚡ Performance** - Handles thousands of concurrent connections efficiently
2. **🛡️ Reliability** - Fault-tolerant with supervisor trees
3. **🛠️ Developer Experience** - Built-in LiveDashboard, IEx REPL
4. **🔒 Type Safety** - Pattern matching and compile-time checks
5. **📈 Scalability** - Designed for distributed systems
6. **⚡ Real-time Ready** - WebSocket/LiveView support out of the box

## Roadmap

### ✅ Phase 1: Frontend Integration (Complete)
- [x] Phoenix backend with PostgreSQL
- [x] Trade CRUD API endpoints
- [x] Statistics endpoint
- [x] React frontend with CRUD UI
- [x] Dashboard with real-time statistics
- [x] Docker setup
- [x] Tests and CI/CD
- [x] Documentation

### 🔄 Phase 2: Data Migration & Cleanup (Next)
- [ ] CSV Import/Export functionality
- [ ] Legacy data migration scripts
- [ ] Remove old Flask backend
- [ ] Remove old Strapi backend
- [ ] Production deployment guide

### 🔮 Phase 3: Enhanced Features
- [ ] Advanced filtering and sorting
- [ ] Pagination for large datasets
- [ ] Charts and visualizations (Recharts)
- [ ] Export for tax reports
- [ ] Trade notes with rich text
- [ ] Tags/categories for trades

### 🔮 Phase 4: Modern Frontend Stack
- [ ] TypeScript migration
- [ ] UI framework (Shadcn/ui or Blueprint)
- [ ] TanStack Query for server state
- [ ] TanStack Table for data grids
- [ ] React Router for navigation
- [ ] Form validation (React Hook Form + Zod)

### 🔮 Phase 5: Advanced Features
- [ ] User authentication (Guardian JWT)
- [ ] Multi-user support
- [ ] Portfolio tracking
- [ ] Real-time price integration
- [ ] Performance analytics
- [ ] Backtesting capabilities
- [ ] Mobile app (React Native)

### 🔮 Phase 6: Production & Scaling
- [ ] Production deployment
- [ ] Monitoring & logging (Sentry)
- [ ] Automated backups
- [ ] Rate limiting
- [ ] Caching layer (Cachex/Redis)
- [ ] Background jobs (Oban)
- [ ] OpenAPI documentation

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`mix test` & `npm test`)
5. Run linters (`mix credo` & `npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Documentation

- [QUICKSTART.md](QUICKSTART.md) - Get started in 5 minutes
- [CHANGELOG.md](CHANGELOG.md) - Detailed change history
- [Backend README](backend_phoenix/README.md) - Backend documentation
- [Frontend README](frontend/README.md) - Frontend documentation

## License

MIT License - see LICENSE file for details

## Support

- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/solaar45/tjournal/issues)
- 💡 **Feature Requests:** [GitHub Issues](https://github.com/solaar45/tjournal/issues)
- 📚 **Documentation:** Check the README files in each directory

---

**Made with ❤️ using Elixir, Phoenix, and React**
