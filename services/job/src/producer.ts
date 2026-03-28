import { Kafka, Producer, Admin } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

let producer: Producer;
let admin: Admin;

export const connectKafka = async () => {
  try {
    const kafka = new Kafka({
      clientId: "auth-service",
      brokers: [process.env.Kafka_Broker || "localhost:9092"],
    });

    admin = kafka.admin();
    await admin.connect();

    const topics = await admin.listTopics();
    if (!topics.includes("send-mail")) {
      await admin.createTopics({
        topics: [
          { topic: "send-mail", numPartitions: 1, replicationFactor: 1 },
        ],
      });
      console.log("✅Kafka topic 'send-mail' created");
    }

    await admin.disconnect();

    producer = kafka.producer();
    await producer.connect();

    console.log("✅Connected to Kafka successfully");
  } catch (error) {
    console.error("failed to connect to Kafka:", error);
  }
};

export const publishToTopic = async (topic: string, message: any) => {
  if (!producer) {
    console.error("Kafka producer is not connected");

    return;
  }
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log("✅Message published to Kafka topic:", topic);
  } catch (error) {
    console.error("failed to publish message to Kafka:", error);
  }
};

export const disconnectKafka = async () => {
  if (producer) {
    await producer.disconnect();
  }
};
