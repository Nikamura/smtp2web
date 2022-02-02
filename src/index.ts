import { SMTPServer, SMTPServerDataStream } from "smtp-server";
import axios from "axios";
import { logger, SMTP2WEB_PORT, SMTP2WEB_WEBHOOK_URL } from "./config";

async function webHookEmail(email: string): Promise<void> {
  const data = email;

  await Promise.allSettled(
    SMTP2WEB_WEBHOOK_URL.map((url, index) => {
      logger.verbose(`invoking webhook ${index}#`);
      return axios(url, {
        method: "POST",
        headers: {
          "Content-Type": "message/rfc822",
        },
        data,
      })
        .then((response) => {
          logger.info(
            `webhook ${index}# response: ${response.status} ${response.statusText}`
          );
          return response;
        })
        .catch((err) => {
          logger.error(`webhook ${index}# error: ${err.message}`);
        });
    })
  );
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
  logger.debug("received email", { email });
  await webHookEmail(email);
}

async function main() {
  logger.info("starting mailserver");
  const server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      logger.info("received email", {
        rcptTo: session.envelope.rcptTo,
      });
      handleEmail(stream);
      stream.on("end", callback);
    },
  });

  server.on("error", (err) => {
    logger.error("Error %s", err.message);
  });

  server.listen(SMTP2WEB_PORT, () => {
    logger.info("mailserver is running");
  });
}

main();
