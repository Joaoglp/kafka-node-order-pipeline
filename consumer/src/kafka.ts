import { Kafka, Producer } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

export const consumer = kafka.consumer({ groupId: 'order-consumer-group' });

export const ORDER_CREATED_TOPIC = 'order-created';
