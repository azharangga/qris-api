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
        description="Decodes a QRIS string into structured Merchant Account Info, TLV tags, MCC, and currency."
        parameters={[
          {
            name: "qris",
            type: "string",
            required: true,
            description: "Full EMVCo QRIS string payload",
          },
        ]}
        inputFields={[
          { name: "qris", label: "QRIS String Payload", placeholder: "000201010211...", defaultValue: VALID_SAMPLE_QRIS }
        ]}
        defaultPayload={{ qris: VALID_SAMPLE_QRIS }}
        snippetGuide={{ qris: "<YOUR_QRIS_STRING>" }}
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
          { name: "qris", label: "QRIS String Payload", placeholder: "000201010211...", defaultValue: VALID_SAMPLE_QRIS }
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
            description: "Payment nominal in IDR (e.g. 50000)",
          },
        ]}
        inputFields={[
          { name: "qris", label: "QRIS String", placeholder: "000201010211...", defaultValue: VALID_SAMPLE_QRIS },
          { name: "amount", label: "Amount (IDR)", placeholder: "50000", defaultValue: "50000" }
        ]}
        defaultPayload={{
          qris: VALID_SAMPLE_QRIS,
          amount: 50000,
        }}
        snippetGuide={{
          qris: "<YOUR_STATIC_QRIS_STRING>",
          amount: 50000,
        }}
      />

      <EndpointDoc
        id="generate"
        method="POST"
        path="/api/qris/generate"
        title="Generate QR Code Image"
        description="Renders a QR code image as Base64 Data URL or SVG string."
        supportsImage={true}
        parameters={[
          {
            name: "text",
            type: "string",
            required: true,
            description: "Text or QRIS payload to encode",
          },
          {
            name: "format",
            type: "string",
            required: false,
            description: "'data_url' (default) or 'svg'",
          },
        ]}
        inputFields={[
          { name: "text", label: "Payload String", placeholder: "QRIS or Text string", defaultValue: VALID_SAMPLE_QRIS },
          { name: "format", label: "Image Format", placeholder: "data_url", defaultValue: "data_url" }
        ]}
        defaultPayload={{
          text: VALID_SAMPLE_QRIS,
          format: "data_url",
        }}
        snippetGuide={{
          text: "<YOUR_QRIS_OR_PAYLOAD_STRING>",
          format: "data_url",
        }}
      />
    </div>
  );
}
