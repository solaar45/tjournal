# Tjournal Backend (Phoenix)

🚀 Trading Journal Backend built with Elixir/Phoenix

## Features

- ✅ RESTful API for trade management
- ✅ PostgreSQL database with Ecto
- ✅ CORS support for frontend integration
- ✅ Statistics and analytics endpoints
- ✅ Docker support
- ✅ LiveDashboard for monitoring

## Tech Stack

- **Elixir** ~> 1.14
- **Phoenix** ~> 1.7
- **Ecto** with PostgreSQL
- **Bandit** (HTTP server)

## Prerequisites

- Elixir 1.14+ and Erlang/OTP 25+
- PostgreSQL 14+
- (Optional) Docker & Docker Compose

## Setup

### Local Development

1. **Install dependencies:**
   ```bash
   mix deps.get
   ```

2. **Configure database:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create and migrate database:**
   ```bash
   mix ecto.create
   mix ecto.migrate
   ```

4. **Seed sample data (optional):**
   ```bash
   mix run priv/repo/seeds.exs
   ```

5. **Start Phoenix server:**
   ```bash
   mix phx.server
   ```

   Or inside IEx:
   ```bash
   iex -S mix phx.server
   ```

The API is now available at [`localhost:4000`](http://localhost:4000)

### Docker Setup

```bash
# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec backend mix ecto.migrate

# Seed data
docker-compose exec backend mix run priv/repo/seeds.exs
```

## API Endpoints

### Trades

```
GET    /api/trades              # List all trades (with optional filters)
POST   /api/trades              # Create a new trade
GET    /api/trades/:id          # Get a specific trade
PUT    /api/trades/:id          # Update a trade
DELETE /api/trades/:id          # Delete a trade
GET    /api/trades/statistics   # Get trading statistics
```

### Query Parameters for Filtering

- `status` - Filter by status (open, closed, pending)
- `type` - Filter by type (Aktie, Zertifikat, Optionsschein, Krypto)
- `side` - Filter by side (Long, Short)
- `symbol` - Search by symbol

### Example Requests

**Create Trade:**
```bash
curl -X POST http://localhost:4000/api/trades \
  -H "Content-Type: application/json" \
  -d '{
    "trade": {
      "symbol": "AAPL",
      "type": "Aktie",
      "shares": 100,
      "side": "Long",
      "entrydate": "2024-01-15",
      "entryprice": "150.00",
      "status": "open"
    }
  }'
```

**Get All Trades:**
```bash
curl http://localhost:4000/api/trades
```

**Filter Trades:**
```bash
curl "http://localhost:4000/api/trades?status=open&type=Aktie"
```

**Get Statistics:**
```bash
curl http://localhost:4000/api/trades/statistics
```

## Testing

```bash
# Run all tests
mix test

# Run with coverage
mix test --cover

# Run specific test file
mix test test/tjournal/trading_test.exs
```

## Code Quality

```bash
# Format code
mix format

# Run linter
mix credo

# Type checking
mix dialyzer
```

## Database Management

```bash
# Create database
mix ecto.create

# Run migrations
mix ecto.migrate

# Rollback last migration
mix ecto.rollback

# Reset database (drop, create, migrate, seed)
mix ecto.reset

# Generate new migration
mix ecto.gen.migration migration_name
```

## Monitoring

Access LiveDashboard at: http://localhost:4000/dev/dashboard

## Production Deployment

### Environment Variables

Required environment variables for production:

```bash
DATABASE_URL=ecto://user:password@host:5432/database
SECRET_KEY_BASE=generate_with_mix_phx_gen_secret
PHX_HOST=yourdomain.com
PORT=4000
```

### Build Release

```bash
# Generate secret key base
mix phx.gen.secret

# Build production release
MIX_ENV=prod mix release

# Run release
_build/prod/rel/tjournal/bin/server
```

### Docker Production Build

```bash
docker build -t tjournal-backend .
docker run -p 4000:4000 --env-file .env tjournal-backend
```

## Project Structure

```
backend_phoenix/
├── config/              # Configuration files
├── lib/
│   ├── tjournal/        # Business logic & contexts
│   │   ├── trading/     # Trading domain
│   │   │   └── trade.ex # Trade schema
│   │   ├── trading.ex   # Trading context
│   │   └── repo.ex      # Database repo
│   └── tjournal_web/    # Web layer
│       ├── controllers/ # API controllers
│       ├── router.ex    # Routes definition
│       └── endpoint.ex  # HTTP endpoint
├── priv/
│   └── repo/
│       ├── migrations/  # Database migrations
│       └── seeds.exs    # Seed data
└── test/                # Test files
```

## Migration from Flask/Strapi

This Phoenix backend replaces the previous Flask and Strapi implementations with:

- **Better performance:** Elixir/Phoenix handles concurrent requests efficiently
- **Type safety:** Pattern matching and compile-time checks
- **Scalability:** Built for distributed systems
- **Real-time capabilities:** WebSocket support out of the box
- **Developer experience:** Interactive IEx shell, LiveDashboard monitoring

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linter
4. Submit a pull request

## License

MIT
