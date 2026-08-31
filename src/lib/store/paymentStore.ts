import { randomUUID } from "crypto";

export type PaymentStatus = "pending" | "paid" | "expired" | "cancelled";

export interface PaymentOrder {
  id: string; // Internal database UUID
  paymentId: string; // Public ID for payment transaction
  invoiceId: string; // Invoice ID
  referenceId: string | null; // External reference ID
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string;
  qrisString: string;
  idempotencyKey?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory store for self-hosted setup
// In production, this would be replaced with a database (Prisma/PostgreSQL/SQLite)
const payments = new Map<string, PaymentOrder>();
const idempotencyCache = new Map<string, string>(); // key: idempotencyKey, value: paymentId

const DEMO_SAMPLE_QRIS = "00020101021226570011ID.DANA.WWW011893600915300026191402090002619140303UMI51440014ID.CO.QRIS.WWW0215ID10254684634640303UMI520473725303360540115802ID5914Rangga Digital6015Kabupaten Cireb6105451836304ED13";
export const DEMO_PAYMENT_ID = "pay_01K4Z8X7M3N5Q2R6T9W8A1B4C";

export function seedDemoPayment(): PaymentOrder {
  const demoPayment: PaymentOrder = {
    id: "a9a3b6f2-51c3-4d89-9a2f-7634891b2c5d",
    paymentId: DEMO_PAYMENT_ID,
    invoiceId: "inv_01K4Z8Y2F7P3M9Q6D4K8R1X5",
    referenceId: "DRV-20260831-8F4K2M",
    amount: 1,
    currency: "IDR",
    status: "pending",
    description: "Demo Live Payment Order",
    qrisString: DEMO_SAMPLE_QRIS,
    expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  payments.set(demoPayment.paymentId, demoPayment);
  return demoPayment;
}

// Seed on startup
seedDemoPayment();

export function createPayment(order: PaymentOrder): PaymentOrder {
  payments.set(order.paymentId, order);
  if (order.idempotencyKey) {
    idempotencyCache.set(order.idempotencyKey, order.paymentId);
  }
  return order;
}

export function getPayment(paymentId: string): PaymentOrder | undefined {
  if (paymentId === DEMO_PAYMENT_ID && !payments.has(paymentId)) {
    seedDemoPayment();
  }
  const payment = payments.get(paymentId);
  if (payment) {
    return evalExpiry(payment);
  }
  return undefined;
}

export function getPaymentByIdempotencyKey(key: string): PaymentOrder | undefined {
  const paymentId = idempotencyCache.get(key);
  if (paymentId) {
    return getPayment(paymentId);
  }
  return undefined;
}

export function updatePaymentStatus(paymentId: string, status: PaymentStatus): PaymentOrder | undefined {
  const payment = payments.get(paymentId);
  if (!payment) return undefined;

  payment.status = status;
  payment.updatedAt = new Date().toISOString();
  payments.set(paymentId, payment);
  return payment;
}

export function listPayments(): PaymentOrder[] {
  const all = Array.from(payments.values()).map(evalExpiry);
  // Sort descending by creation date
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Helper to auto-expire payments lazily
function evalExpiry(payment: PaymentOrder): PaymentOrder {
  if (payment.status === "pending") {
    if (new Date() > new Date(payment.expiresAt)) {
      payment.status = "expired";
      payment.updatedAt = new Date().toISOString();
      payments.set(payment.paymentId, payment);
    }
  }
  return payment;
}

function generateULIDLike(): string {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let result = '';
  for (let i = 0; i < 26; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generatePaymentId(): string {
  return "pay_" + generateULIDLike();
}

export function generateInvoiceId(): string {
  return "inv_" + generateULIDLike();
}

