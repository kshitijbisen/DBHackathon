export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year' | 'one_time';
  features: string[];
  popular?: boolean;
  stripePriceId: string;
}

export interface PaymentSession {
  sessionId: string;
  url: string;
}

export interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
  plan_name: string;
  cancel_at_period_end: boolean;
}