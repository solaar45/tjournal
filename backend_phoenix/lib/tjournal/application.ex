defmodule Tjournal.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      Tjournal.Repo,
      TjournalWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:tjournal, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Tjournal.PubSub},
      TjournalWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: Tjournal.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    TjournalWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
