defmodule Tjournal.TradingTest do
  use Tjournal.DataCase

  alias Tjournal.Trading

  describe "trades" do
    alias Tjournal.Trading.Trade

    import Tjournal.TradingFixtures

    @invalid_attrs %{symbol: nil, type: nil, shares: nil, side: nil, entrydate: nil, entryprice: nil}

    test "list_trades/0 returns all trades" do
      trade = trade_fixture()
      assert Trading.list_trades() == [trade]
    end

    test "list_trades/1 filters trades by status" do
      _open_trade = trade_fixture(%{status: "open"})
      closed_trade = trade_fixture(%{status: "closed", symbol: "TSLA", exitdate: ~D[2024-02-01], exitprice: Decimal.new("200.00")})
      
      assert Trading.list_trades(%{status: "closed"}) == [closed_trade]
    end

    test "get_trade!/1 returns the trade with given id" do
      trade = trade_fixture()
      assert Trading.get_trade!(trade.id) == trade
    end

    test "create_trade/1 with valid data creates a trade" do
      valid_attrs = %{
        symbol: "AAPL",
        type: "Aktie",
        status: "open",
        shares: 100,
        side: "Long",
        entrydate: ~D[2024-01-01],
        entryprice: Decimal.new("150.00")
      }

      assert {:ok, %Trade{} = trade} = Trading.create_trade(valid_attrs)
      assert trade.symbol == "AAPL"
      assert trade.type == "Aktie"
      assert trade.shares == 100
    end

    test "create_trade/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Trading.create_trade(@invalid_attrs)
    end

    test "create_trade/1 validates type inclusion" do
      invalid_attrs = %{
        symbol: "AAPL",
        type: "InvalidType",
        shares: 100,
        side: "Long",
        entrydate: ~D[2024-01-01],
        entryprice: Decimal.new("150.00")
      }

      assert {:error, changeset} = Trading.create_trade(invalid_attrs)
      assert "is invalid" in errors_on(changeset).type
    end

    test "update_trade/2 with valid data updates the trade" do
      trade = trade_fixture()
      update_attrs = %{
        status: "closed",
        exitdate: ~D[2024-02-01],
        exitprice: Decimal.new("165.00")
      }

      assert {:ok, %Trade{} = trade} = Trading.update_trade(trade, update_attrs)
      assert trade.status == "closed"
      assert trade.exitprice == Decimal.new("165.00")
    end

    test "delete_trade/1 deletes the trade" do
      trade = trade_fixture()
      assert {:ok, %Trade{}} = Trading.delete_trade(trade)
      assert_raise Ecto.NoResultsError, fn -> Trading.get_trade!(trade.id) end
    end

    test "change_trade/1 returns a trade changeset" do
      trade = trade_fixture()
      assert %Ecto.Changeset{} = Trading.change_trade(trade)
    end

    test "calculate_statistics/0 returns correct statistics" do
      # Create some test trades
      trade_fixture(%{
        status: "closed",
        exitdate: ~D[2024-02-01],
        exitprice: Decimal.new("165.00"),
        entryprice: Decimal.new("150.00"),
        shares: 100
      })

      trade_fixture(%{
        symbol: "TSLA",
        status: "closed",
        exitdate: ~D[2024-03-01],
        exitprice: Decimal.new("180.00"),
        entryprice: Decimal.new("200.00"),
        shares: 50
      })

      stats = Trading.calculate_statistics()
      
      assert stats.total_trades == 2
      assert is_number(stats.winning_trades)
      assert is_number(stats.losing_trades)
    end
  end
end
