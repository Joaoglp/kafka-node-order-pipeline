# Kafka Node Order Pipeline

## Status: Ongoing

- ~~Kafka + Zookeeper running locally via Docker Compose~~
- Producer service (Express + TypeScript) publishing order events
- Consumer service processing events and calling the Claude API for analysis
- End-to-end test run

## What it will do

1. A **producer** service exposes a REST endpoint that accepts new orders and publishes them as events to a Kafka topic.
2. A **consumer** service subscribes to that topic and, for each order, sends the data to **Claude API** for an analysis.

## Stack

Node.js, TypeScript, Express, KafkaJS, Anthropic SDK (Claude), Docker

## Running it locally

### 1. Start Kafka
\`\`\`bash
docker compose up -d
\`\`\`
Kafka UI available at http://localhost:8080

(Producer and consumer setup instructions pending)