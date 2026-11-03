/** Public contract and runtime instrumentation exports. */

export {
  configureTelemetry as configure,
  log,
  observe,
  setupTelemetry,
  shutdownTelemetry as shutdown,
  span,
} from "./application/instrumentation.js";
export type { AgentSpanOptions, TelemetryOptions } from "./application/telemetry-options.js";
export { LOG_LEVELS, SPAN_TYPES } from "./domain/telemetry.js";
export type {
  AgentIdentity,
  AgentLogLevel,
  AgentSpanType,
  TelemetryAttributes,
  TelemetryAttributeValue,
} from "./domain/types.js";
