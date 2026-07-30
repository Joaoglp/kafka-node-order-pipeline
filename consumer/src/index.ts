import 'dotenv/config';
import { consumer, ORDER_CREATED_TOPIC } from './kafka';
import { OrderEvent } from './types';
import { analyzeOrder } from './claude';

async function main() {
  await consumer.connect();
  await consumer.subscribe({ topic: ORDER_CREATED_TOPIC, fromBeginning: true });

  console.log(`Listening for messages on topic: ${ORDER_CREATED_TOPIC}`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const orderEvent: OrderEvent = JSON.parse(
        message.value?.toString() || '{}',
      );
      console.log(`Received order event: ${JSON.stringify(orderEvent)}`);

      try {
        const analysis = await analyzeOrder(orderEvent.order);
        console.log(
          `Order analysis for order ID ${orderEvent.order.id}: ${JSON.stringify(analysis)}`,
        );
      } catch (error) {
        console.error(
          `Error analyzing order ID ${orderEvent.order.id}:`,
          error,
        );
      }
    },
  });
}

main().catch((error) => {
  console.error('Error in consumer:', error);
  process.exit(1);
});
