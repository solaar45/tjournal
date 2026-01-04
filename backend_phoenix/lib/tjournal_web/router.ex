defmodule TjournalWeb.Router do
  use TjournalWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", TjournalWeb do
    pipe_through :api

    resources "/trades", TradeController, except: [:new, :edit]
    get "/trades/statistics", TradeController, :statistics
  end

  if Application.compile_env(:tjournal, :dev_routes) do
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: TjournalWeb.Telemetry
    end
  end
end
