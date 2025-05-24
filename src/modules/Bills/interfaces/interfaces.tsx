export interface IBill {
    id: number;
    currency: string;
    amount: number;
    subtotal: number;
    tax: number;
    discount: number;
    status: string;
    type: string;
    invoice_number: string;
    customer: string;
    expect_payment_time: string;
    metadata: JSON;
    created_at: string;
}

export interface IBillDetailsData {
    expect_payment_time: string; // ISO8601 date string
    currency: string;
    customer_id: number;
    order_id: number;
    car_id: number;
    admin_id: number;
    amount: number;
    balance: number;
    subTotal: number;
    tax: number;
    discount: number;
    describe: string;
    metadata: object;
    type: number;
    // organizationId: number;
  }