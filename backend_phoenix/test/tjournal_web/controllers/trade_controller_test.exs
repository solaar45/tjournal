defmodule TjournalWeb.TradeControllerTest do
  use TjournalWeb.ConnCase

  import Tjournal.TradingFixtures

  alias Tjournal.Trading.Trade

  @create_attrs %{
    symbol: "AAPL",
    type: "Aktie",
    status: "open",
    shares: 100,
    side: "Long",
    entrydate: ~D[2024-01-01],
    entryprice: "150.00"
  }
  @update_attrs %{
    status: "closed",
    exitdate: ~D[2024-02-01],
    exitprice: "165.00"
  }
  @invalid_attrs %{symbol: nil, type: nil, shares: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all trades", %{conn: conn} do
      conn = get(conn, ~p"/api/trades")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create trade" do
    test "renders trade when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/trades", trade: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/trades/#{id}")

      assert %{
               "id" => ^id,
               "symbol" => "AAPL",
               "type" => "Aktie",
               "shares" => 100,
               "side" => "Long"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/trades", trade: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update trade" do
    setup [:create_trade]

    test "renders trade when data is valid", %{conn: conn, trade: %Trade{id: id} = trade} do
      conn = put(conn, ~p"/api/trades/#{trade}", trade: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/trades/#{id}")

      assert %{
               "id" => ^id,
               "status" => "closed"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, trade: trade} do
      conn = put(conn, ~p"/api/trades/#{trade}", trade: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete trade" do
    setup [:create_trade]

    test "deletes chosen trade", %{conn: conn, trade: trade} do
      conn = delete(conn, ~p"/api/trades/#{trade}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/trades/#{trade}")
      end
    end
  end

  describe "statistics" do
    test "returns trading statistics", %{conn: conn} do
      conn = get(conn, ~p"/api/trades/statistics")
      assert %{"data" => stats} = json_response(conn, 200)
      assert Map.has_key?(stats, "total_trades")
    end
  end

  defp create_trade(_) do
    trade = trade_fixture()
    %{trade: trade}
  end
end
