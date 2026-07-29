import express, { Request, Response } from 'express';
import { getProducer, ORDER_CREATED_TOPIC } from './kafka';
import { Order, OrderEvent } from './types';
import { randomUUID } from 'crypto';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/orders', async (req: Request, res: Response) => {
    try {
        const { customerName, channel, items, notes } = req.body;

        if (!customerName || !channel || !items || !Array.isArray(items)) {
            return res.status(400).json({
                error: 'customerName, channel and a non-empty items[] array are required',
            });
        }

        const order: Order = {
            id: randomUUID(),
            customerName,
            items,
            notes
        };

        const orderEvent: OrderEvent = {
            id: randomUUID(),
            order: order,
            channel,
            timestamp: new Date().toISOString()
        };

        const producer = await getProducer();

        await producer.send({
            topic: ORDER_CREATED_TOPIC,
            messages: [{ key: orderEvent.id, value: JSON.stringify(orderEvent) }],
        });

        // console.log(`Published order ${orderEvent.id} to ${ORDER_CREATED_TOPIC}`);
        res.status(202).json({ orderId: order.id, status: 'published' });

    } catch (error) {
        // console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to publish order event' });
    }
});

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Producer service is running on port ${PORT}`);
});

// curl -X POST http://localhost:3000/orders \
//   -H "Content-Type: application/json" \
//   -d '{
//     "customerName": "TEST",
//     "channel": "B2B",
//     "items": [
//       { "id": "001", "description": "TEST", "quantity": 50, "price": 100 }
//     ]
//   }'