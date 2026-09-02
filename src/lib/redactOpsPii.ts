const PHONE = /\b[6-9]\d{9}\b/g;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

export function redactOpsText(value: unknown) {
  return String(value || "")
    .replace(PHONE, "******")
    .replace(EMAIL, "[email]");
}

export function redactOpsHitsForLlm<T extends { title?: unknown; detail?: unknown }>(
  hits: T[]
): T[] {
  return hits.map((hit) => ({
    ...hit,
    title: redactOpsText(hit.title),
    detail: redactOpsText(hit.detail),
  }));
}
