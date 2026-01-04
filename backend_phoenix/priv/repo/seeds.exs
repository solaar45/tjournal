# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Tjournal.Repo.insert!(%Tjournal.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias Tjournal.Trading

# Example trades for testing
trades = [
  %{
    symbol: "AAPL",
    type: "Aktie",
    status: "closed",
    shares: 100,
    side: "Long",
    entrydate: ~D[2024-01-15],
    entryprice: Decimal.new("150.00"),
    exitdate: ~D[2024-02-20],
    exitprice: Decimal.new("165.00"),
    notes: "Good earnings report"
  },
  %{
    symbol: "TSLA",
    type: "Aktie",
    status: "open",
    shares: 50,
    side: "Long",
    entrydate: ~D[2024-03-01],
    entryprice: Decimal.new("200.00"),
    notes: "Long term hold"
  },
  %{
    symbol: "BTC",
    type: "Krypto",
    status: "closed",
    shares: 1,
    side: "Long",
    entrydate: ~D[2024-01-01],
    entryprice: Decimal.new("40000.00"),
    exitdate: ~D[2024-03-15],
    exitprice: Decimal.new("65000.00"),
    notes: "Bull run"
  }
]

Enum.each(trades, fn trade_params ->
  case Trading.create_trade(trade_params) do
    {:ok, trade} ->
      IO.puts("Created trade: #{trade.symbol}")
    {:error, changeset} ->
      IO.inspect(changeset.errors, label: "Error creating trade")
  end
end)

IO.puts("\n✅ Seed data inserted successfully!")
