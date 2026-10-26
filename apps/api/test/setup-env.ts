// Runs before each e2e test file, i.e. before AppModule is imported:
// ConfigModule reads the environment at import time, and process.env wins
// over apps/api/.env, so e2e tests use this key whatever .env contains.
process.env.ADMIN_API_KEY = "e2e-admin-key-0123456789abcdef0123456789";
