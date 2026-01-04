defmodule TjournalWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :tjournal

  @session_options [
    store: :cookie,
    key: "_tjournal_key",
    signing_salt: "SECRET_SALT",
    same_site: "Lax"
  ]

  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]]

  plug Plug.Static,
    at: "/",
    from: :tjournal,
    gzip: false,
    only: TjournalWeb.static_paths()

  if code_reloading? do
    plug Phoenix.CodeReloader
    plug Phoenix.Ecto.CheckRepoStatus, otp_app: :tjournal
  end

  plug Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options

  plug CORSPlug,
    origin: ["http://localhost:3000", "http://localhost:5173"],
    max_age: 86400,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

  plug TjournalWeb.Router
end
