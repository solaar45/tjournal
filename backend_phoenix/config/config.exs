import Config

config :tjournal,
  ecto_repos: [Tjournal.Repo],
  generators: [timestamp_type: :utc_datetime]

config :tjournal, TjournalWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: TjournalWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Tjournal.PubSub,
  live_view: [signing_salt: "SECRET_KEY_BASE"]

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

import_config "#{config_env()}.exs"
