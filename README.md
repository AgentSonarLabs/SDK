# AI Agent Observability SDK

Standalone TypeScript SDK repository for instrumenting AI agent applications and exporting telemetry to the self-hosted backend.

## Status

This package scaffold establishes the publishing and source layout. Instrumentation functions such as `observe()`, `span()`, and `log()` will be implemented against the OTLP contract in the workspace-level `specs/` documents. They are not exported yet.

## Source layout

- `src/config`: endpoint and SDK configuration resolution.
- `src/constants`: telemetry names and attributes.
- `src/types`: public telemetry and configuration types.
- `src/utils`: reusable normalization helpers.
- `src/internal`: implementation details that are not part of the public API.

The npm package name is a working name and can be changed before the first public release.

