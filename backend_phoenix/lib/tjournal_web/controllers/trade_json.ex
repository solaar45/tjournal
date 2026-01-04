defmodule TjournalWeb.TradeJSON do
  alias Tjournal.Trading.Trade

  @doc """
  Renders a list of trades.
  """
  def index(%{trades: trades}) do
    %{data: for(trade <- trades, do: data(trade))}
  end

  @doc """
  Renders a single trade.
  """
  def show(%{trade: trade}) do
    %{data: data(trade)}
  end

  defp data(%Trade{} = trade) do
    %{
      id: trade.id,
      symbol: trade.symbol,
      type: trade.type,
      status: trade.status,
      shares: trade.shares,
      side: trade.side,
      entrydate: trade.entrydate,
      entryprice: trade.entryprice,
      exitdate: trade.exitdate,
      exitprice: trade.exitprice,
      notes: trade.notes,
      pnl: calculate_pnl(trade),
      inserted_at: trade.inserted_at,
      updated_at: trade.updated_at
    }
  end

  defp calculate_pnl(%Trade{exitprice: nil}), do: nil
  defp calculate_pnl(%Trade{entryprice: nil}), do: nil
  defp calculate_pnl(%Trade{shares: nil}), do: nil
  
  defp calculate_pnl(%Trade{exitprice: exitprice, entryprice: entryprice, shares: shares}) do
    Decimal.mult(
      Decimal.sub(exitprice, entryprice),
      Decimal.new(shares)
    )
  end
end
