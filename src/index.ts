/** Public type and constant exports for the SDK package scaffold. */
export { TELEMETRY_ATTRIBUTES, STANDARD_TELEMETRY_ATTRIBUTES } from "./constants/attributes.js";
export { LOG_LEVELS, SPAN_TYPES } from "./constants/telemetry.js";
export { DEFAULT_OTLP_ENDPOINT, resolveOtlpEndpoint } from "./config/resolve-endpoint.js";
export type {
  AgentIdentity,
  AgentLogLevel,
  AgentSpanType,
  TelemetryAttributeValue,
  TelemetryAttributes,
} from "./types/telemetry.js";
export type { TelemetryOptions } from "./types/config.js";
export { normalizeError } from "./utils/normalize-error.js";
