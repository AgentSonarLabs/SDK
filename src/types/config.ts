import type { AgentIdentity } from "./telemetry.js";

export interface TelemetryOptions {
  /** Base URL for the backend's OTLP/HTTP receiver. */
  endpoint?: string;
  /** Additional headers sent with OTLP requests. */
  headers?: Record<string, string>;
  /** Optional service and agent resource information. */
  identity?: AgentIdentity;
}

