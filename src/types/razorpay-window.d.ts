export type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type RazorpayCheckoutInstance = {
  open: () => void;
  on: (
    event: string,
    handler: (response: { error?: { description?: string } }) => void
  ) => void;
};

export type RazorpayCheckoutOptions = {
  key: string;
  amount?: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill: { name: string; contact: string };
  notes: Record<string, string>;
  theme: { color: string };
  handler: (response: RazorpayCheckoutResponse) => void | Promise<void>;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

export {};
