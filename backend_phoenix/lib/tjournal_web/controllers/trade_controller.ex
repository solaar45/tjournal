defmodule TjournalWeb.TradeController do
  use TjournalWeb, :controller

  alias Tjournal.Trading
  alias Tjournal.Trading.Trade

  action_fallback TjournalWeb.FallbackController

  def index(conn, params) do
    trades = 
      if map_size(params) > 0 do
        Trading.list_trades(params)
      else
        Trading.list_trades()
      end

    render(conn, :index, trades: trades)
  end

  def create(conn, %{"trade" => trade_params}) do
    with {:ok, %Trade{} = trade} <- Trading.create_trade(trade_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/trades/#{trade}")
      |> render(:show, trade: trade)
    end
  end

  def show(conn, %{"id" => id}) do
    trade = Trading.get_trade!(id)
    render(conn, :show, trade: trade)
  end

  def update(conn, %{"id" => id, "trade" => trade_params}) do
    trade = Trading.get_trade!(id)

    with {:ok, %Trade{} = trade} <- Trading.update_trade(trade, trade_params) do
      render(conn, :show, trade: trade)
    end
  end

  def delete(conn, %{"id" => id}) do
    trade = Trading.get_trade!(id)

    with {:ok, %Trade{}} <- Trading.delete_trade(trade) do
      send_resp(conn, :no_content, "")
    end
  end

  def statistics(conn, _params) do
    stats = Trading.calculate_statistics()
    json(conn, %{data: stats})
  end
end
