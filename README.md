# Agent Observability TypeScript SDK

TypeScript instrumentation helpers for exporting AI agent traces and structured logs over OTLP/HTTP.

## Status

Active development. Public exports and supported behavior are defined by the package source; the workspace-level [`specs/`](../specs/) describes the intended contract.

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

Verify exports against the installed version before relying on APIs during this pre-release phase.

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
