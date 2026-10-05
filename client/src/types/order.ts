export type OrderStatus = "contacted" | "purchased" | "cancelled";
export type OrderSource = "whatsapp";

export interface CreateOrderItemInput {
    productId: string;
    productTitle: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string | null;
}

export interface CreateLeadOrderInput {
    checkoutSessionId: string;
    sellerId: string;
    customerId?: string | null;
    customerName: string;
    customerEmail?: string | null;
    customerPhone: string;
    items: CreateOrderItemInput[];
}

export interface CreatedOrder {
    $id: string;
    checkoutSessionId: string;
    sellerId: string;
    customerId: string | null;
    status: OrderStatus;
    source: OrderSource;
    subtotal: number;
    total: number;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string;
    contactedAt: string;
    purchasedAt: string | null;
    cancelledAt: string | null;
}

export interface CreatedOrderItem {
    $id: string;
    orderId: string;
    productId: string;
    productTitle: string;
    quantity: number;
    unitPrice: number;
    total: number;
    imageUrl: string | null;
}

export interface CreatedLeadOrder {
    order: CreatedOrder;
    items: CreatedOrderItem[];
}
