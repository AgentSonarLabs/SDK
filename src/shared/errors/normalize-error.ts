export function normalizeError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === "string") return new Error(value);

  try {
    const serialized = JSON.stringify(value);
    return new Error(serialized ?? String(value));
  } catch {
    return new Error(String(value));
  }
}
