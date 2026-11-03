import type { AgentIdentity, TelemetryAttributes } from "../domain/types.js";

export interface TelemetryOptions {
  /** Base URL for the backend's OTLP/HTTP receiver. */
  endpoint?: string;
  /** Additional headers sent with OTLP requests. */
  headers?: Record<string, string>;
  /** Optional service and agent resource information. */
  identity?: AgentIdentity;
}

export interface AgentSpanOptions {
  /** Semantic kind used to distinguish agent, model, and tool work. */
  type?: "agent" | "llm" | "tool" | "error" | "session";
  /** Additional attributes attached to the span. */
  attributes?: TelemetryAttributes;
}
