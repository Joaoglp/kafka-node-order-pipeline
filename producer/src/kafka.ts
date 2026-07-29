import { Kafka, Producer } from "kafkajs";

const kafka = new Kafka({
  clientId: 'producer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

let producer: Producer | null = null;

export async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
  }
  return producer;
}

export const ORDER_CREATED_TOPIC = 'order-created';