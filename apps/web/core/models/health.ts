export type ServiceState = "up" | "down";

export type SystemHealth = {
  api: ServiceState;
  /** Unknown when the API itself can't be reached. */
  database: ServiceState | "unknown";
};
