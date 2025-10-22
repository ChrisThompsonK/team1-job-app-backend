import "dotenv/config";

type NodeEnvironment = "development" | "production" | "test";

interface EnvironmentConfig {
  port: number;
  databaseUrl: string;
  nodeEnv: NodeEnvironment;
  corsOrigin: string;
  betterAuthSecret: string;
  betterAuthUrl: string;

  jobSchedulerCronExpression: string;
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

const validateBetterAuthSecret = (secret: string): string => {
  if (!secret || secret.trim() === "") {
    throw new Error("BETTER_AUTH_SECRET cannot be empty");
  }
  if (secret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be at least 32 characters long for security"
    );
  }
  return secret;
};

const validateBetterAuthUrl = (url: string): string => {
  if (!url || url.trim() === "") {
    throw new Error("BETTER_AUTH_URL cannot be empty");
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error(
      "BETTER_AUTH_URL must be a valid URL starting with http:// or https://"
    );
  }
  try {
    new URL(url);
  } catch {
    throw new Error("BETTER_AUTH_URL must be a valid URL format");
  }
  return url;
};

const validateCronExpression = (cronExpression: string): string => {
  if (!cronExpression || cronExpression.trim() === "") {
    throw new Error("JOB_SCHEDULER_CRON_EXPRESSION cannot be empty");
  }

  // Basic validation - cron expression should have 5 or 6 parts
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length !== 5 && parts.length !== 6) {
    throw new Error(
      `Invalid cron expression: ${cronExpression}. Must have 5 or 6 parts (minute hour day month weekday [year])`
    );
  }

  // Basic validation of each part
  const cronPatterns = [
    /^(\*|[0-9]|[1-5][0-9]|\/[0-9]+|\*\/[0-9]+|[0-9]+-[0-9]+)$/, // minute (0-59)
    /^(\*|[0-9]|1[0-9]|2[0-3]|\/[0-9]+|\*\/[0-9]+|[0-9]+-[0-9]+)$/, // hour (0-23)
    /^(\*|[1-9]|[12][0-9]|3[01]|\/[0-9]+|\*\/[0-9]+|[0-9]+-[0-9]+)$/, // day (1-31)
    /^(\*|[1-9]|1[0-2]|\/[0-9]+|\*\/[0-9]+|[0-9]+-[0-9]+|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$/i, // month (1-12)
    /^(\*|[0-6]|\/[0-9]+|\*\/[0-9]+|[0-9]+-[0-9]+|SUN|MON|TUE|WED|THU|FRI|SAT)$/i, // weekday (0-6)
  ];

  for (let i = 0; i < Math.min(parts.length, 5); i++) {
    const part = parts[i];
    const pattern = cronPatterns[i];
    if (!part || !pattern || !pattern.test(part)) {
      throw new Error(
        `Invalid cron expression part "${part}" at position ${i + 1} in: ${cronExpression}`
      );
    }
  }

  return cronExpression;
};

const loadEnvironmentConfig = (): EnvironmentConfig => {
  try {
    const port = validatePort(getEnvVariable("PORT", "3001"));
    const databaseUrl = validateDatabaseUrl(
      getEnvVariable("DATABASE_URL", "file:jobApp.db")
    );
    const nodeEnv = validateNodeEnv(getEnvVariable("NODE_ENV", "development"));
    const corsOrigin = getEnvVariable("CORS_ORIGIN", "*");
    const jobSchedulerCronExpression = validateCronExpression(
      getEnvVariable("JOB_SCHEDULER_CRON_EXPRESSION", "0 1 * * *")
    );

    // For test environment, provide default values to avoid process.exit
    const isTestEnv =
      nodeEnv === "test" ||
      process.env.NODE_ENV === "test" ||
      process.env.VITEST === "true" ||
      typeof (globalThis as { it?: unknown }).it === "function";

    let betterAuthSecret: string;
    let betterAuthUrl: string;

    if (isTestEnv) {
      // Use safe defaults for testing
      betterAuthSecret = getEnvVariable(
        "BETTER_AUTH_SECRET",
        "test-secret-with-at-least-32-characters-for-testing"
      );
      betterAuthUrl = getEnvVariable(
        "BETTER_AUTH_URL",
        "http://localhost:3001"
      );
    } else {
      betterAuthSecret = validateBetterAuthSecret(
        getEnvVariable("BETTER_AUTH_SECRET")
      );
      betterAuthUrl = validateBetterAuthUrl(getEnvVariable("BETTER_AUTH_URL"));
    }

    return {
      port,
      databaseUrl,
      nodeEnv,
      corsOrigin,
      betterAuthSecret,
      betterAuthUrl,
      jobSchedulerCronExpression,
    };
  } catch (error) {
    const isTestEnv =
      process.env.NODE_ENV === "test" ||
      process.env.VITEST === "true" ||
      typeof (globalThis as { it?: unknown }).it === "function";

    if (isTestEnv) {
      // In test environment, throw the error instead of calling process.exit
      throw error;
    } else {
      console.error("❌ Environment configuration error:");
      console.error(error instanceof Error ? error.message : String(error));
      console.error(
        "\n💡 Tip: Check your .env file or copy .env.example to .env"
      );
      process.exit(1);
    }
  }
};

export const env: EnvironmentConfig = loadEnvironmentConfig();

/**
 * Utility function to get the job scheduler cron expression
 * Default: "0 1 * * *" (runs daily at 1:00 AM UTC)
 * @returns Job scheduler cron expression
 */
export const getJobSchedulerCronExpression = (): string => {
  return env.jobSchedulerCronExpression;
};
