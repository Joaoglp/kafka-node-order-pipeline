# Kafka Node Order Pipeline

## Status: Completed

- [x] Kafka + Zookeeper running locally via Docker Compose
- [x] Producer service (Express + TypeScript) publishing order events
- [x] Consumer service processing events and calling the Claude API for analysis
- [x] End-to-end test run

## What it will do

1. A **producer** service exposes a REST endpoint that accepts new orders and publishes them as events to a Kafka topic.
2. A **consumer** service subscribes to that topic and, for each order, sends the data to **Claude API** for an analysis.

## Stack

Node.js, TypeScript, Express, KafkaJS, Anthropic SDK (Claude), Docker

## Running it locally

### 1. Start Kafka

```bash
docker compose up -d
```

Kafka UI available at http://localhost:8080

### 2. Start the consumer

```bash
cd consumer
```
Create a `.env` file with:

```
KAFKA_BROKER=localhost:9092
ANTHROPIC_API_KEY=sk-ant-api...
```

```bash
npm install
npm run dev
```

### 3. Start the producer

cd producer
create .env file
add port and kafka broker

e.g:
PORT=3000
KAFKA_BROKER=localhost:9092

```bash
npm install
npm run dev
```

### Test Order

curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
  "customerName": "TEST",
  "channel": "B2B",
  "items": [
    { "id": "001", "description": "TEST", "quantity": 50, "price": 100 }
  ]
}'

### Running tests

cd producer && npm run test
cd consumer && npm run test

### Prettify code

cd producer && npm run format
cd consumer && npm run format