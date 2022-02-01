import { SMTPServer, SMTPServerDataStream } from "smtp-server";
import axios from "axios";
import { SMTP2WEB_PORT, SMTP2WEB_WEBHOOK_URL } from "./config";

async function webHookEmail(email: string): Promise<void> {
  const data = email;

  const response = await axios(SMTP2WEB_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "message/rfc822",
    },
    data,
  });
  console.debug("Webhook invoked: %s", response.statusText);
}

async function streamToString(stream: SMTPServerDataStream): Promise<string> {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf-8");
}

async function handleEmail(stream: SMTPServerDataStream) {
  const email = await streamToString(stream);
  console.debug("received email");
  await webHookEmail(email);
}

async function main() {
  console.debug("starting mailserver");
  const server = new SMTPServer({
    authOptional: true,
    onData(stream, _session, callback) {
      handleEmail(stream);
      stream.on("end", callback);
    },
  });

  server.on("error", (err) => {
    console.error("Error %s", err.message);
  });

  server.listen(SMTP2WEB_PORT, () => {
    console.info("mailserver is running");
  });
}

main();
