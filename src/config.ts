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
);

export const SMTP2WEB_PORT = parseInt(process.env.SMTP2WEB_PORT || "25", 10);
