import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractJson, analyzeOrder } from '../claude';
import { Order } from '../types';

describe('extractJson', () => {
  it('should extract JSON from a ```json fenced response', () => {
    const raw = '```json\n{"summary": "test"}\n```';
    expect(extractJson(raw)).toBe('{"summary": "test"}');
  });

  it('should extract JSON from a ``` fenced response, no tag', () => {
    const raw = '```\n{"summary": "test"}\n```';
    expect(extractJson(raw)).toBe('{"summary": "test"}');
  });

  it('returns the raw text trimmed when there is no fence', () => {
    const raw = '  {"summary": "test"}  ';
    expect(extractJson(raw)).toBe('{"summary": "test"}');
  });

  it('should return the raw string if no fenced code block is found', () => {
    const raw = '{"summary": "test"}';
    expect(extractJson(raw)).toBe('{"summary": "test"}');
  });
});

const mockAnthropic = vi.hoisted(() => vi.fn());

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class {
      messages = { create: mockAnthropic };
    },
  };
});

const sampleOrder: Order = {
  id: 'order123',
  customerName: 'John Doe',
  items: [
    { id: 'item1', description: 'Widget A', quantity: 2, price: 10.0 },
    { id: 'item2', description: 'Widget B', quantity: 1, price: 20.0 },
  ],
  notes: 'Please deliver between 9 AM and 5 PM.',
};

describe('analyzeOrder', () => {
  beforeEach(() => {
    mockAnthropic.mockReset();
  });

  it('parses a clean JSON response from claude', async () => {
    mockAnthropic.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            summary: 'Order is valid and ready for processing.',
            flaggedForReview: false,
            flagReason: null,
            suggestedActions: 'Process the order as usual.',
          }),
        },
      ],
    });

    const result = await analyzeOrder(sampleOrder);

    expect(result.summary).toBe('Order is valid and ready for processing.');
    expect(result.flaggedForReview).toBe(false);
  });

  it('parses a fenced JSON response from claude', async () => {
    mockAnthropic.mockResolvedValue({
      content: [
        {
          type: 'text',
          text:
            '```json\n' +
            JSON.stringify({
              summary: 'Order is valid and ready for processing.',
              flaggedForReview: true,
              flagReason: 'Some items are out of stock.',
              suggestedActions: 'Process the order as usual.',
            }) +
            '\n```',
        },
      ],
    });

    const result = await analyzeOrder(sampleOrder);

    expect(result.flaggedForReview).toBe(true);
    expect(result.flagReason).toBe('Some items are out of stock.');
    expect(result.suggestedActions).toBe('Process the order as usual.');
  });

  it('throws an error when claude returns invalid JSON', async () => {
    mockAnthropic.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'Oops, something went wrong!',
        },
      ],
    });

    await expect(analyzeOrder(sampleOrder)).rejects.toThrow(
      'Failed to parse Claude response as JSON',
    );
  });

  it('throws an error when claude returns no text block at all', async () => {
    mockAnthropic.mockResolvedValue({
      content: [],
    });

    await expect(analyzeOrder(sampleOrder)).rejects.toThrow(
      'No text response from Claude',
    );
  });
});
