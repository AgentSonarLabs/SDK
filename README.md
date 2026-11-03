# AI Agent Observability SDK

Standalone TypeScript SDK repository for instrumenting AI agent applications and exporting telemetry to the self-hosted backend.

## Status

This package scaffold establishes the publishing and source layout. Instrumentation functions such as `observe()`, `span()`, and `log()` will be implemented against the OTLP contract in the workspace-level `specs/` documents. They are not exported yet.

## Source layout

- `src/domain`: telemetry vocabulary and product-independent SDK types.
- `src/application`: public SDK options and future instrumentation use cases.
- `src/infrastructure/otlp`: OTLP endpoint, attribute keys, and exporter integration.
- `src/shared`: internal helpers shared across SDK modules.
- `src/index.ts`: public package boundary; infrastructure helpers stay private.

Dependency direction points inward: application code may use domain types and define ports; infrastructure implements those ports. Domain and application code must not depend on infrastructure. The current agent attribute prefix is provisional and is not re-exported from the package root.

The npm package name is a working name and can be changed before the first public release.
