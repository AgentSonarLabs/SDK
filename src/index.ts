/** Public type and constant exports for the SDK package scaffold. */
export { TELEMETRY_ATTRIBUTES, STANDARD_TELEMETRY_ATTRIBUTES } from "./constants/attributes.js";
export { LOG_LEVELS, SPAN_TYPES } from "./constants/telemetry.js";
export type {
  AgentIdentity,
  AgentLogLevel,
  AgentSpanType,
  TelemetryAttributeValue,
  TelemetryAttributes,
} from "./types/telemetry.js";
