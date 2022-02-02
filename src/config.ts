import winston from "winston";

export function ensureString(
  target: string | null | undefined,
  name: string
): string {
  if (!target) throw new Error(`${name} is not set.`);
  return target;
}

export const SMTP2WEB_WEBHOOK_URL = ensureString(
  process.env.SMTP2WEB_WEBHOOK_URL,
  "SMTP2WEB_WEBHOOK_URL"
).split("|");

export const SMTP2WEB_PORT = parseInt(process.env.SMTP2WEB_PORT || "25", 10);

export const logger = winston.createLogger({
  level: "verbose",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...rest }) => {
      const stringifiedRest = JSON.stringify(rest);

      if (stringifiedRest !== "{}") {
        return `${timestamp} ${level}: ${message} ${stringifiedRest}`;
      } else {
        return `${timestamp} ${level}: ${message}`;
      }
    })
  ),
  transports: [new winston.transports.Console()],
});
