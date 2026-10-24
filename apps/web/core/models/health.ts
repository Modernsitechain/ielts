export type AppEnv = "local" | "development" | "staging" | "production";

export type ServiceState = "up" | "down";

export type SystemHealth = {
  /** Deployment the web app is running in (APP_ENV). */
  environment: AppEnv;
  api: ServiceState;
  /** Unknown when the API itself can't be reached. */
  database: ServiceState | "unknown";
};
