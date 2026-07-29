export interface Item {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    customerName: string;
    items: Item[];
    notes?: string;
}

export interface OrderEvent {
    id: string;
    order: Order;
    channel: 'WEB' | 'MOBILE' | 'POS' | 'B2B';
    // eventType: 'CREATED' | 'UPDATED' | 'DELETED';
    timestamp: string;
}