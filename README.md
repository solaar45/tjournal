# TJournal - Trading Journal

📈 A modern, full-stack trading journal application for tracking and analyzing your trades.

## Project Status

⚠️ **This project is currently being migrated to a modern tech stack:**

- ✅ **New Backend:** Phoenix/Elixir (see `backend_phoenix/`)
- 🔄 **Frontend:** React (planned upgrade to modern stack)
- ❌ **Legacy Backends:** Flask (`backend/`) and Strapi (`backend-2/`) - deprecated

## Features

- 📊 Track trades across multiple asset types (Stocks, Crypto, Options, Certificates)
- 💰 Calculate P&L and trading statistics
- 📅 Monitor entry/exit dates and prices
- 📊 Long and Short position tracking
- 📄 Export and import trade data
- 📊 Performance analytics and dashboards

## Tech Stack

### Active Development (Phoenix Backend)

- **Backend:** Elixir 1.16+ / Phoenix 1.7
- **Database:** PostgreSQL 16
- **API:** RESTful JSON API
- **Features:** CORS, LiveDashboard, Telemetry

### Frontend (Current)

- **Framework:** React 18
- **HTTP Client:** Axios
- **CSV Parsing:** Papa Parse

### Legacy (Deprecated)

- ❌ Flask + MySQL (`backend/`)
- ❌ Strapi 3.6 + SQLite (`backend-2/`)

## Quick Start

### Phoenix Backend

```bash
cd backend_phoenix

# Install dependencies
mix deps.get

# Setup database
mix ecto.setup

# Start server
mix phx.server
```

API available at: http://localhost:4000/api

For detailed instructions, see [`backend_phoenix/README.md`](backend_phoenix/README.md)

### Docker Setup

```bash
cd backend_phoenix
docker-compose up -d
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend available at: http://localhost:3000

## API Documentation

### Endpoints

```
GET    /api/trades              # List all trades
POST   /api/trades              # Create trade
GET    /api/trades/:id          # Get trade
PUT    /api/trades/:id          # Update trade
DELETE /api/trades/:id          # Delete trade
GET    /api/trades/statistics   # Get statistics
```

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
  "notes": "Long term hold",
  "pnl": null
}
```

## Development

### Prerequisites

- Elixir 1.14+ and Erlang/OTP 25+
- PostgreSQL 14+
- Node.js 18+ (for frontend)
- Docker & Docker Compose (optional)

### Running Tests

```bash
# Backend tests
cd backend_phoenix
mix test

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Backend
cd backend_phoenix
mix format        # Format code
mix credo         # Linting
mix dialyzer      # Type checking

# Frontend
cd frontend
npm run lint
```

## Project Structure

```
tjournal/
├── backend_phoenix/    # ✅ New Phoenix backend
│   ├── lib/
│   │   ├── tjournal/       # Business logic
│   │   └── tjournal_web/   # Web/API layer
│   ├── priv/repo/       # Migrations & seeds
│   ├── test/            # Tests
│   └── README.md        # Backend docs
├── frontend/           # React frontend
├── backend/            # ❌ Deprecated Flask
├── backend-2/          # ❌ Deprecated Strapi
└── README.md           # This file
```

## Migration Notes

### Why Phoenix?

The migration from Flask/Strapi to Phoenix brings:

1. **Performance:** Elixir's concurrency model handles thousands of connections efficiently
2. **Reliability:** Fault-tolerant by design with supervisor trees
3. **Developer Experience:** Built-in LiveDashboard, interactive IEx shell
4. **Type Safety:** Pattern matching and compile-time checks
5. **Scalability:** Built for distributed systems from day one
6. **Real-time Ready:** WebSocket support out of the box

### Data Migration

To migrate data from old backends:

```bash
# Export from old backend
# Import to Phoenix
cd backend_phoenix
mix run priv/repo/import_legacy_data.exs
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### Phase 1: Backend Migration (Current) ✅
- [x] Phoenix setup with PostgreSQL
- [x] Trade CRUD operations
- [x] Statistics endpoint
- [x] Docker setup
- [x] Tests
- [x] CI/CD pipeline

### Phase 2: Frontend Upgrade
- [ ] Migrate to TypeScript
- [ ] Add UI framework (Shadcn/Blueprint)
- [ ] Implement TanStack Query
- [ ] Add TanStack Table for data grids
- [ ] Dashboard with charts
- [ ] Advanced filtering

### Phase 3: Advanced Features
- [ ] User authentication
- [ ] Multi-user support
- [ ] Real-time price updates
- [ ] Performance analytics
- [ ] Portfolio tracking
- [ ] Export for tax reports
- [ ] Backtesting features

### Phase 4: Production
- [ ] Production deployment
- [ ] Monitoring & logging
- [ ] Automated backups
- [ ] API documentation (OpenAPI)

## License

MIT

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [Phoenix Backend README](backend_phoenix/README.md) for backend-specific docs

---

**Note:** The old Flask and Strapi backends are deprecated and will be removed in a future release. Please use the Phoenix backend for all new development.
