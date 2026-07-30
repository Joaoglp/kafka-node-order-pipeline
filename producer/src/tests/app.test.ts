import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../kafka', () => ({
    getProducer: vi.fn().mockResolvedValue({
        send: vi.fn().mockResolvedValue(undefined),
    }),
    ORDER_CREATED_TOPIC: 'order-created'
}));

import { app } from '../app';

describe('POST /orders', () => {
    it('publishes a valid order to Kafka and returns 202', async () => {
        const response = await request(app)
            .post('/orders')
            .send({
                customerName: 'John Doe',
                channel: 'B2B',
                items: [
                    { id: 'abc', description: 'Product A', quantity: 2, price: 10.0 },
                    { id: 'def', description: 'Product B', quantity: 1, price: 15.0 }
                ]
      });

    expect(response.status).toBe(202);
    expect(response.body).toHaveProperty('orderId');
    expect(response.body.status).toBe('published');
  });

    it('rejects a request with missing customerName', async () => {
        const response = await request(app)
            .post('/orders')
            .send({
                channel: 'B2B',
                items: [
                    { id: 'abc', description: 'Product A', quantity: 2, price: 10.0 },
                    { id: 'def', description: 'Product B', quantity: 1, price: 15.0 }
                ]
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('rejects a request with missing channel', async () => {
        const response = await request(app)
            .post('/orders')
            .send({
                customerName: 'John Doe',
                items: [
                    { id: 'abc', description: 'Product A', quantity: 2, price: 10.0 },
                    { id: 'def', description: 'Product B', quantity: 1, price: 15.0 }
                ]
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('rejects a request with empty items array', async () => {
        const response = await request(app)
            .post('/orders')
            .send({
                customerName: 'John Doe',
                channel: 'B2B',
                items: []
            });

        expect(response.status).toBe(400);
    });

    it('rejects a request with items missing entirely', async () => {
        const response = await request(app)
            .post('/orders')
            .send({
                customerName: 'John Doe',
                channel: 'B2B'
            });

        expect(response.status).toBe(400);
    });
});

describe('GET /health', () => {
    it('returns 200 OK', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });
});
