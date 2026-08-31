# Indonesian QRIS Payment Gateway API

Lightweight, open-source, and self-hosted dynamic QRIS payment engine and developer gateway built on top of Next.js 16 and TypeScript.

---

## ⚡ Features

- **EMVCo Compliant Engine**: Full TLV parsing, CRC16 verification, tag validation, and dynamic conversion according to Bank Indonesia specifications.
- **Payment Lifecycle Store**: In-memory payment orders with state transitions (`pending`, `paid`, `expired`, `cancelled`), automatic expiry evaluation, and `Idempotency-Key` deduplication.
- **Zero Heavy Dependencies**: Pure TypeScript core calculation, no heavy runtime bloat.
- **Self-Hosted & Privacy First**: No merchant account locking, no forced commercial API keys or registration walls.

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/azharanggakusuma/qris-api.git
cd qris-api
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the interactive documentation and playground.

### 3. CLI Mode
```bash
npm run cli
```

---

## 📡 API Reference

### Response Standard
All API endpoints return consistent envelopes:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_xyz123",
    "timestamp": "2026-08-31T07:00:00.000Z"
  }
}
```

### Core QRIS Endpoints
- `GET /api/health` - Check service uptime and status.
- `POST /api/qris/validate` - Check CRC16 checksum and required EMVCo tags.
- `POST /api/qris/parse` - Parse raw QRIS payload into clean developer-friendly JSON.
- `POST /api/qris/convert` - Convert static QRIS to dynamic with nominal & convenience fee.
- `POST /api/qris/decode` - Decode raw QR string or image scanner content.

### QRIS Payment Services
- `POST /api/payments` - Create a QRIS payment order (supports `Idempotency-Key` header).
- `GET /api/payments` - List payment orders with status filter & pagination.
- `GET /api/payments/:id` - Get payment status & dynamic QR string.
- `POST /api/payments/:id/cancel` - Cancel a pending payment order.
- `POST /api/payments/:id/confirm` - Mark a payment as paid.
- `GET /api/payments/:id/qr` - Generate QR Code image endpoint (PNG/SVG) for `<img>` tags.

---

## 📄 License
MIT © [Azharangga Kusuma](https://github.com/azharanggakusuma)
