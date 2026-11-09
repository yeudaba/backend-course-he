import { Producer, stringSerializers } from "@platformatic/kafka";
import { loadConfig } from "./config.ts";
import { createIngestServer } from "./ingest.ts";

const cfg = loadConfig(process.env);
const producer = new Producer({ clientId: "ingest", bootstrapBrokers: cfg.KAFKA_BROKERS, serializers: stringSerializers, idempotent: true });
const server = createIngestServer({ producer, topic: cfg.EVENTS_TOPIC, apiKeys: cfg.API_KEYS });
server.listen(cfg.PORT, () => console.log(JSON.stringify({ level: "info", msg: "ingest listening", port: cfg.PORT })));
process.on("SIGTERM", () => server.close(async () => (await producer.close(), process.exit(0)))); // פרק 24: כיבוי מסודר
