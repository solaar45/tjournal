defmodule Tjournal.Trading do
  @moduledoc """
  The Trading context.
  """

  import Ecto.Query, warn: false
  alias Tjournal.Repo
  alias Tjournal.Trading.Trade

  @doc """
  Returns the list of trades.

  ## Examples

      iex> list_trades()
      [%Trade{}, ...]

  """
  def list_trades do
    Repo.all(from t in Trade, order_by: [desc: t.inserted_at])
  end

  @doc """
  Returns the list of trades with optional filters.

  ## Examples

      iex> list_trades(%{status: "open"})
      [%Trade{}, ...]

  """
  def list_trades(filters) when is_map(filters) do
    query = from t in Trade, order_by: [desc: t.inserted_at]

    query
    |> filter_by_status(filters)
    |> filter_by_type(filters)
    |> filter_by_side(filters)
    |> filter_by_symbol(filters)
    |> Repo.all()
  end

  defp filter_by_status(query, %{status: status}) when not is_nil(status) do
    from t in query, where: t.status == ^status
  end
  defp filter_by_status(query, _), do: query

  defp filter_by_type(query, %{type: type}) when not is_nil(type) do
    from t in query, where: t.type == ^type
  end
  defp filter_by_type(query, _), do: query

  defp filter_by_side(query, %{side: side}) when not is_nil(side) do
    from t in query, where: t.side == ^side
  end
  defp filter_by_side(query, _), do: query

  defp filter_by_symbol(query, %{symbol: symbol}) when not is_nil(symbol) do
    from t in query, where: ilike(t.symbol, ^"%#{symbol}%")
  end
  defp filter_by_symbol(query, _), do: query

  @doc """
  Gets a single trade.

  Raises `Ecto.NoResultsError` if the Trade does not exist.

  ## Examples

      iex> get_trade!(123)
      %Trade{}

      iex> get_trade!(456)
      ** (Ecto.NoResultsError)

  """
  def get_trade!(id), do: Repo.get!(Trade, id)

  @doc """
  Creates a trade.

  ## Examples

      iex> create_trade(%{field: value})
      {:ok, %Trade{}}

      iex> create_trade(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_trade(attrs \\ %{}) do
    %Trade{}
    |> Trade.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a trade.

  ## Examples

      iex> update_trade(trade, %{field: new_value})
      {:ok, %Trade{}}

      iex> update_trade(trade, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_trade(%Trade{} = trade, attrs) do
    trade
    |> Trade.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a trade.

  ## Examples

      iex> delete_trade(trade)
      {:ok, %Trade{}}

      iex> delete_trade(trade)
      {:error, %Ecto.Changeset{}}

  """
  def delete_trade(%Trade{} = trade) do
    Repo.delete(trade)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking trade changes.

  ## Examples

      iex> change_trade(trade)
      %Ecto.Changeset{data: %Trade{}}

  """
  def change_trade(%Trade{} = trade, attrs \\ %{}) do
    Trade.changeset(trade, attrs)
  end

  @doc """
  Calculates statistics for trades.
  """
  def calculate_statistics do
    closed_trades = from(t in Trade, where: t.status == "closed")

    total_trades = Repo.aggregate(closed_trades, :count)
    
    stats_query = from t in closed_trades,
      select: %{
        total_pnl: fragment("SUM((? - ?) * ?)", t.exitprice, t.entryprice, t.shares),
        avg_pnl: fragment("AVG((? - ?) * ?)", t.exitprice, t.entryprice, t.shares),
        winning_trades: fragment("COUNT(CASE WHEN ? > ? THEN 1 END)", t.exitprice, t.entryprice),
        losing_trades: fragment("COUNT(CASE WHEN ? < ? THEN 1 END)", t.exitprice, t.entryprice)
      }

    stats = Repo.one(stats_query) || %{total_pnl: 0, avg_pnl: 0, winning_trades: 0, losing_trades: 0}

    Map.put(stats, :total_trades, total_trades)
  end
end
