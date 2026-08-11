import { Kafka, Producer, Admin } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

let producer: Producer;
let admin: Admin;

export const connectKafka = async () => {
  try {
    const broker = process.env.Kafka_Broker || "localhost:9092";
    const isLocal = broker.includes("localhost") || broker.includes("127.0.0.1");

    const kafka = new Kafka({
      clientId: "auth-service",
      brokers: [broker],
      ssl: isLocal ? false : { rejectUnauthorized: false },
      ...(process.env.KAFKA_USER && process.env.KAFKA_PASS
        ? {
            sasl: {
              mechanism: "plain",
              username: process.env.KAFKA_USER,
              password: process.env.KAFKA_PASS,
            },
          }
        : {}),
    });

    try {
      admin = kafka.admin();
      await admin.connect();

      const topics = await admin.listTopics();

      if (!topics.includes("send-mail")) {
        await admin.createTopics({
          topics: [
            {
              topic: "send-mail",
              numPartitions: 1,
              replicationFactor: 1,
            },
          ],
        });
        console.log("✅ Topic 'send-mail' created");
      }

      await admin.disconnect();
    } catch (adminErr) {
      console.log("Kafka admin notice:", adminErr);
    }

    producer = kafka.producer();

    await producer.connect();

    console.log("✅ connected to kafka producer");
  } catch (error) {
    console.log("Failed to connect to kafka", error);
  }
};

export const publishToTopic = async (topic: string, message: any) => {
  if (!producer) {
    console.log("kafka producer is not initialized");
    return;
  }

  try {
    await producer.send({
      topic: topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
  } catch (error) {
    console.log("Failed to publish message to kafka", error);
  }
};

export const disconnectKafka = async () => {
  if (producer) {
    producer.disconnect();
  }
};
