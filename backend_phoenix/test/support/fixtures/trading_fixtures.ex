defmodule Tjournal.TradingFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Tjournal.Trading` context.
  """

  @doc """
  Generate a trade.
  """
  def trade_fixture(attrs \\ %{}) do
    {:ok, trade} =
      attrs
      |> Enum.into(%{
        symbol: "AAPL",
        type: "Aktie",
        status: "open",
        shares: 100,
        side: "Long",
        entrydate: ~D[2024-01-01],
        entryprice: Decimal.new("150.00"),
        notes: "Test trade"
      })
      |> Tjournal.Trading.create_trade()

    trade
  end
end
