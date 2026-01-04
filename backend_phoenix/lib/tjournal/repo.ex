defmodule Tjournal.Repo do
  use Ecto.Repo,
    otp_app: :tjournal,
    adapter: Ecto.Adapters.Postgres
end
