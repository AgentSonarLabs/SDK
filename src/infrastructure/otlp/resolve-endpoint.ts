import type { TelemetryOptions } from "../../application/telemetry-options.js";

export const DEFAULT_OTLP_ENDPOINT = "http://127.0.0.1:4318";

export function resolveOtlpEndpoint(
  options: TelemetryOptions = {},
  environment: Record<string, string | undefined> = process.env,
): string {
  const candidate =
    options.endpoint?.trim() ||
    environment.AGENT_OBSERVABILITY_ENDPOINT?.trim() ||
    environment.OTEL_EXPORTER_OTLP_ENDPOINT?.trim() ||
    DEFAULT_OTLP_ENDPOINT;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new TypeError(`Invalid OTLP endpoint URL: ${candidate}`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("OTLP endpoint must use http or https");
  }

  return url.toString().replace(/\/+$/, "");
}
