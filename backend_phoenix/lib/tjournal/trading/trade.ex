defmodule Tjournal.Trading.Trade do
  use Ecto.Schema
  import Ecto.Changeset

  @trade_types ["Aktie", "Zertifikat", "Optionsschein", "Krypto"]
  @trade_sides ["Long", "Short"]
  @trade_statuses ["open", "closed", "pending"]

  schema "trades" do
    field :symbol, :string
    field :type, :string
    field :status, :string, default: "open"
    field :shares, :integer
    field :side, :string
    field :entrydate, :date
    field :entryprice, :decimal
    field :exitdate, :date
    field :exitprice, :decimal
    field :notes, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(trade, attrs) do
    trade
    |> cast(attrs, [
      :symbol,
      :type,
      :status,
      :shares,
      :side,
      :entrydate,
      :entryprice,
      :exitdate,
      :exitprice,
      :notes
    ])
    |> validate_required([:symbol, :type, :shares, :side, :entrydate, :entryprice])
    |> validate_inclusion(:type, @trade_types)
    |> validate_inclusion(:side, @trade_sides)
    |> validate_inclusion(:status, @trade_statuses)
    |> validate_number(:shares, greater_than: 0)
    |> validate_number(:entryprice, greater_than: 0)
    |> validate_exit_fields()
  end

  defp validate_exit_fields(changeset) do
    status = get_field(changeset, :status)
    exitprice = get_field(changeset, :exitprice)
    exitdate = get_field(changeset, :exitdate)

    cond do
      status == "closed" and (is_nil(exitprice) or is_nil(exitdate)) ->
        changeset
        |> add_error(:exitprice, "must be present when status is closed")
        |> add_error(:exitdate, "must be present when status is closed")

      not is_nil(exitprice) ->
        validate_number(changeset, :exitprice, greater_than: 0)

      true ->
        changeset
    end
  end

  def trade_types, do: @trade_types
  def trade_sides, do: @trade_sides
  def trade_statuses, do: @trade_statuses
end
