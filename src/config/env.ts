import "dotenv/config";

type NodeEnvironment = "development" | "production" | "test";

interface EnvironmentConfig {
  port: number;
  databaseUrl: string;
  nodeEnv: NodeEnvironment;
  corsOrigin: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || "";
};

const validatePort = (portString: string): number => {
  const port = Number.parseInt(portString, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT value: ${portString}. Must be a number between 1 and 65535.`
    );
  }
  return port;
};

const validateNodeEnv = (env: string): NodeEnvironment => {
  const validEnvironments: NodeEnvironment[] = [
    "development",
    "production",
    "test",
  ];
  if (!validEnvironments.includes(env as NodeEnvironment)) {
    throw new Error(
      `Invalid NODE_ENV value: ${env}. Must be one of: ${validEnvironments.join(", ")}`
    );
  }
  return env as NodeEnvironment;
};

const validateDatabaseUrl = (url: string): string => {
  if (!url || url.trim() === "") {
    throw new Error("DATABASE_URL cannot be empty");
  }
  // Basic validation - should start with file: or http(s):
  if (
    !url.startsWith("file:") &&
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) {
    throw new Error(
      `Invalid DATABASE_URL format: ${url}. Must start with 'file:', 'http://', or 'https://'`
    );
  }
  return url;
};

const loadEnvironmentConfig = (): EnvironmentConfig => {
  try {
    const port = validatePort(getEnvVariable("PORT", "3001"));
    const databaseUrl = validateDatabaseUrl(
      getEnvVariable("DATABASE_URL", "file:jobApp.db")
    );
    const nodeEnv = validateNodeEnv(
      getEnvVariable("NODE_ENV", "development")
    );
    const corsOrigin = getEnvVariable("CORS_ORIGIN", "*");

    return {
      port,
      databaseUrl,
      nodeEnv,
      corsOrigin,
    };
  } catch (error) {
    console.error("❌ Environment configuration error:");
    console.error(error instanceof Error ? error.message : String(error));
    console.error(
      "\n💡 Tip: Check your .env file or copy .env.example to .env"
    );
    process.exit(1);
  }
};

export const env: EnvironmentConfig = loadEnvironmentConfig();
