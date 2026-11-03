/** Public contract exports. Runtime instrumentation exports will be added with the SDK implementation. */
export { LOG_LEVELS, SPAN_TYPES } from "./domain/telemetry.js";
export type {
  AgentIdentity,
  AgentLogLevel,
  AgentSpanType,
  TelemetryAttributeValue,
  TelemetryAttributes,
} from "./domain/types.js";
export type { TelemetryOptions } from "./application/telemetry-options.js";
