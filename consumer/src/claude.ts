import Anthropic from '@anthropic-ai/sdk';
import { Order, OrderAnalysis } from './types';

const anthropic = new Anthropic();

const MODEL = 'claude-sonnet-4-6';

const MAX_TOKENS = 1024;

export function extractJson(raw: string): string {
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    return jsonMatch ? jsonMatch[1] : raw.trim();
}

export async function analyzeOrder(order: Order): Promise<OrderAnalysis> {
    const items = order.items
        .map(item => `- ${item.quantity} x ${item.description} (ID: ${item.id}, Price: $${item.price})`)
        .join('\n');

    const prompt = `You are a backend service that analyzes e-commerce orders. Given the following order details, provide a summary of the order, 
      determine if it should be flagged for review, and suggest any actions that should be taken.

    Order ID: ${order.id} from ${order.customerName}:
    Items:
    ${items}
    Notes: ${order.notes || 'None'}

    Please provide your analysis in the following JSON format:
    {
        "summary": "A brief summary of the order.",
        "flaggedForReview": true or false,
        "flagReason": "Reason for flagging, if applicable.",
        "suggestedActions": "Any suggested actions to take."
    }`;

    const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
    });

    const text = response.content.find(block => block.type === 'text');

    if (!text || text.type !== 'text') {
        throw new Error('No text response from Claude.');
    }
    
    // console.log('Raw Claude response:', text.text);

    try {
        const analysis: OrderAnalysis = JSON.parse(extractJson(text.text));
        return analysis;
    } catch (error) {
        throw new Error('Failed to parse Claude response as JSON.');
    }
}