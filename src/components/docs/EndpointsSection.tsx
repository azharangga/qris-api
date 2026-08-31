"use client";

import { EndpointDoc } from "./EndpointDoc";

const VALID_SAMPLE_QRIS = "00020101021126570011ID.DANA.WWW011893600915300026191402090002619140303UMI51440014ID.CO.QRIS.WWW0215ID10254684634640303UMI5204737253033605802ID5914Rangga Digital6015Kabupaten Cireb610545183630495B3";

export function EndpointsSection() {
  return (
    <div className="space-y-2">
      <EndpointDoc
        id="health"
        method="GET"
        path="/api/health"
        title="Health Check"
        description="Returns API status, creator metadata, version, and runtime uptime."
        parameters={[]}
      />

      <EndpointDoc
        id="parse"
        method="POST"
        path="/api/qris/parse"
        title="Parse QRIS"
        description="Decodes a QRIS string into clean merchant info, payment details, and acquirer breakdown."
        parameters={[
          {
            name: "qris",
            type: "string",
            required: true,
            description: "Full EMVCo QRIS string payload",
          },
        ]}
        inputFields={[
          { name: "qris", label: "QRIS String Payload *", placeholder: "000201010211...", defaultValue: "" }
        ]}
        defaultPayload={{ qris: VALID_SAMPLE_QRIS }}
        snippetGuide={{ qris: "<YOUR_QRIS_STRING>" }}
      />

      <EndpointDoc
        id="decode"
        method="POST"
        path="/api/qris/decode"
        title="Decode QRIS Image Content"
        description="Extract and parse QRIS data from scanned QR strings."
        parameters={[
          {
            name: "raw",
            type: "string",
            required: true,
            description: "Raw string decoded from QR image scan",
          },
        ]}
        inputFields={[
          { name: "raw", label: "Raw QR String *", placeholder: "000201010211...", defaultValue: "" }
        ]}
        defaultPayload={{ raw: VALID_SAMPLE_QRIS }}
        snippetGuide={{ raw: "<RAW_QR_STRING_FROM_SCANNER>" }}
      />

      <EndpointDoc
        id="validate"
        method="POST"
        path="/api/qris/validate"
        title="Validate QRIS"
        description="Validates CRC16 checksum integrity and mandatory EMVCo tags."
        parameters={[
          {
            name: "qris",
            type: "string",
            required: true,
            description: "Full EMVCo QRIS string payload",
          },
        ]}
        inputFields={[
          { name: "qris", label: "QRIS String Payload *", placeholder: "000201010211...", defaultValue: "" }
        ]}
        defaultPayload={{ qris: VALID_SAMPLE_QRIS }}
        snippetGuide={{ qris: "<YOUR_QRIS_STRING>" }}
      />

      <EndpointDoc
        id="convert"
        method="POST"
        path="/api/qris/convert"
        title="Convert Dynamic QRIS"
        description="Transforms a static QRIS payload into a dynamic payment code with custom transaction amount."
        supportsImage={true}
        parameters={[
          {
            name: "qris",
            type: "string",
            required: true,
            description: "Static QRIS string",
          },
          {
            name: "amount",
            type: "number",
            required: true,
            description: "Payment nominal in IDR (integer)",
          },
          {
            name: "format",
            type: "string",
            required: false,
            description: "Output format: 'data_url' (default) or 'svg'",
          },
        ]}
        inputFields={[
          { name: "qris", label: "QRIS String *", placeholder: "000201010211...", defaultValue: "" },
          { name: "amount", label: "Amount (IDR) *", placeholder: "e.g., 50000", defaultValue: "" },
        ]}
        defaultPayload={{
          qris: VALID_SAMPLE_QRIS,
          amount: 1,
          format: "data_url"
        }}
        snippetGuide={{
          qris: "<YOUR_STATIC_QRIS_STRING>",
          amount: "<AMOUNT>",
          format: "data_url"
        }}
      />

      <EndpointDoc
        id="create-payment"
        method="POST"
        path="/api/qris/payment"
        title="Create QRIS Payment"
        description="Creates a new dynamic QRIS payment invoice with expiry and idempotency support."
        hasPaymentTabs={true}
        supportsImage={true}
        parameters={[
          {
            name: "qris",
            type: "string",
            required: true,
            description: "Static QRIS string of the merchant",
          },
          {
            name: "amount",
            type: "number",
            required: true,
            description: "Transaction amount in IDR (integer)",
          },
          {
            name: "referenceId",
            type: "string",
            required: false,
            description: "Custom external reference ID (Optional, returns null if empty)",
          },
          {
            name: "expiresIn",
            type: "number",
            required: false,
            description: "Expiry time in seconds (Optional, default 86400 / 24h)",
          }
        ]}
        inputFields={[
          { name: "qris", label: "Static QRIS *", placeholder: "000201...", defaultValue: "" },
          { name: "amount", label: "Amount (IDR) *", placeholder: "e.g., 25000", defaultValue: "" },
          { name: "referenceId", label: "Reference ID", placeholder: "e.g., DRV-20260831-8F4K2M" },
          { name: "expiresIn", label: "Expires In (Seconds)", placeholder: "e.g., 86400 (24h)" }
        ]}
        defaultPayload={{
          qris: VALID_SAMPLE_QRIS,
          amount: 1,
          referenceId: "DRV-20260831-8F4K2M",
          expiresIn: 86400
        }}
        snippetGuide={{
          qris: "<STATIC_QRIS>",
          amount: "<AMOUNT>",
          referenceId: "<REFERENCE_ID>",
          expiresIn: "<EXPIRES_IN_SECONDS>"
        }}
      />
      
      <EndpointDoc
        id="get-payment"
        method="GET"
        path="/api/qris/payment/[id]"
        title="Get Payment Details"
        description="Fetch a specific payment order status, receipt, and dynamic QRIS payload by its ID."
        supportsImage={true}
        parameters={[
          {
            name: "id",
            type: "string",
            required: true,
            description: "The payment order ID (e.g., pay_01K4Z8X7M3N5Q2R6T9W8A1B4C)",
          }
        ]}
        inputFields={[
          { name: "id", label: "Payment ID *", placeholder: "pay_...", defaultValue: "" }
        ]}
        defaultPayload={{ id: "pay_01K4Z8X7M3N5Q2R6T9W8A1B4C" }}
        snippetGuide={{ id: "<PAYMENT_ID>" }}
      />

      <EndpointDoc
        id="cancel-payment"
        method="POST"
        path="/api/qris/payment/[id]/cancel"
        title="Cancel Payment"
        description="Cancel a pending payment order."
        parameters={[
          {
            name: "id",
            type: "string",
            required: true,
            description: "The payment order ID (e.g., pay_01K4Z8X7M3N5Q2R6T9W8A1B4C)",
          }
        ]}
        inputFields={[
          { name: "id", label: "Payment ID *", placeholder: "pay_...", defaultValue: "" }
        ]}
        defaultPayload={{ id: "pay_01K4Z8X7M3N5Q2R6T9W8A1B4C" }}
        snippetGuide={{ id: "<PAYMENT_ID>" }}
      />

      <EndpointDoc
        id="confirm-payment"
        method="POST"
        path="/api/qris/payment/[id]/confirm"
        title="Confirm Payment"
        description="Manually mark a pending payment as paid. Useful for sandbox/development."
        parameters={[
          {
            name: "id",
            type: "string",
            required: true,
            description: "The payment order ID (e.g., pay_01K4Z8X7M3N5Q2R6T9W8A1B4C)",
          }
        ]}
        inputFields={[
          { name: "id", label: "Payment ID *", placeholder: "pay_...", defaultValue: "" }
        ]}
        defaultPayload={{ id: "pay_01K4Z8X7M3N5Q2R6T9W8A1B4C" }}
        snippetGuide={{ id: "<PAYMENT_ID>" }}
      />

      <EndpointDoc
        id="qr-payment"
        method="GET"
        path="/api/qris/payment/[id]/qr"
        title="Generate QR Code"
        description="Stream a PNG, JPEG, WEBP, or SVG representation of the payment order's QR code. Can be used directly in an <img> tag."
        supportsImage={true}
        parameters={[
          {
            name: "id",
            type: "string",
            required: true,
            description: "The payment order ID",
          },
          {
            name: "format",
            type: "string",
            required: false,
            description: "'png', 'jpeg', 'webp', or 'svg' (default 'png')",
          }
        ]}
        inputFields={[
          { name: "id", label: "Payment ID *", placeholder: "pay_...", defaultValue: "" },
          { name: "format", label: "Format", placeholder: "png", defaultValue: "png", options: ["png", "jpeg", "webp", "svg"] }
        ]}
        defaultPayload={{ id: "pay_01K4Z8X7M3N5Q2R6T9W8A1B4C", format: "png" }}
        snippetGuide={{ id: "<PAYMENT_ID>", format: "png" }}
      />
    </div>
  );
}
