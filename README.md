# Agent Observability TypeScript SDK

TypeScript instrumentation helpers for exporting AI agent traces and structured logs over OTLP/HTTP.

## Install

```sh
npm install agent-observability-sdk
```

## Usage

```ts
import { configure, observe, span, log, shutdown } from "agent-observability-sdk";

configure({ endpoint: "http://127.0.0.1:4318", identity: { name: "support-agent" } });
try {
  await observe("support-agent", async () => span("lookup-customer", async () => {
    log("info", "Looking up customer", { customerId: "customer-123" });
    return "done";
  }, { type: "tool" }));
} finally {
  await shutdown();
}
```

`configure` accepts an explicit OTLP/HTTP base endpoint and optional authorization headers and service identity. Without an explicit endpoint, the SDK checks `AGENT_OBSERVABILITY_ENDPOINT`, the legacy `BLAZO_ENDPOINT`, then `OTEL_EXPORTER_OTLP_ENDPOINT`, and defaults to `http://127.0.0.1:4318`. `observe` creates an agent span, `span` creates a tool/model/session span, and `log` emits a structured log inside the active trace context. Callback errors are recorded on the span and rethrown unchanged.

## Development

```sh
npm install
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Use Changesets for user-visible package changes. See [CHANGELOG.md](CHANGELOG.md), [SECURITY.md](SECURITY.md), and [CONTRIBUTING.md](CONTRIBUTING.md). License: [MIT](LICENSE).
