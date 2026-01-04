defmodule Tjournal.Repo.Migrations.CreateTrades do
  use Ecto.Migration

  def change do
    create table(:trades) do
      add :symbol, :string, null: false
      add :type, :string, null: false
      add :status, :string, default: "open", null: false
      add :shares, :integer, null: false
      add :side, :string, null: false
      add :entrydate, :date, null: false
      add :entryprice, :decimal, precision: 15, scale: 4, null: false
      add :exitdate, :date
      add :exitprice, :decimal, precision: 15, scale: 4
      add :notes, :text

      timestamps(type: :utc_datetime)
    end

    create index(:trades, [:symbol])
    create index(:trades, [:status])
    create index(:trades, [:type])
    create index(:trades, [:entrydate])
  end
end
