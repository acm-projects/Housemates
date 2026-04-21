const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
if (!API_BASE_URL) {
  console.error("No URL defined in .env");
}
function joinUrl(path: string) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { raw: text };
  }
}

function throwIfErrorPayload(data: Record<string, unknown>) {
  const msg =
    typeof data.message === "string"
      ? data.message
      : typeof data.error === "string"
        ? data.error
        : null;
  if (msg) throw new Error(msg);
}

/** Several Housemates Lambdas are on API Gateway GET but read a JSON body (non-standard).
 *  React Native's fetch rejects GET+body, so we encode params as a query string instead. */
export async function apiGetWithBody(path: string, body: unknown) {
  const params = new URLSearchParams();
  if (body && typeof body === "object") {
    for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
      if (v !== undefined && v !== null) params.set(k, String(v));
    }
  }
  const qs = params.toString();
  const url = joinUrl(path) + (qs ? `?${qs}` : "");
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throwIfErrorPayload(data);
    throw new Error("API request failed");
  }
  return data;
}

/** Normalize Dynamo-style query results from various handler response shapes. */
export function extractDynamoItems(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.items)) return o.items as Record<string, unknown>[];
  const resp = o.response;
  if (resp != null && typeof resp === "object") {
    const r = resp as Record<string, unknown>;
    if (Array.isArray(r.Items)) return r.Items as Record<string, unknown>[];
    const item = r.Item;
    if (item != null && typeof item === "object")
      return [item as Record<string, unknown>];
  }
  return [];
}

export async function apiGet(path: string) {
  const response = await fetch(joinUrl(path), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throwIfErrorPayload(data);
    throw new Error("API request failed");
  }
  return data;
}

export async function apiPost(path: string, body: unknown) {
  const response = await fetch(joinUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throwIfErrorPayload(data);
    throw new Error("API request failed");
  }
  return data;
}

export async function apiPut(path: string, body: unknown) {
  const response = await fetch(joinUrl(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throwIfErrorPayload(data);
    throw new Error("API request failed");
  }
  return data;
}

export async function apiDelete(path: string, body?: unknown) {
  const response = await fetch(joinUrl(path), {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throwIfErrorPayload(data);
    throw new Error("API request failed");
  }
  return data;
}

/** @deprecated Prefer apiGet / apiPost / apiPut / apiDelete */
export async function apiRequest(path: string, method: string, body?: unknown) {
  const url = joinUrl(path);
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body:
      body !== undefined && method !== "GET" && method !== "HEAD"
        ? JSON.stringify(body)
        : undefined,
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throwIfErrorPayload(data);
    throw new Error("API request failed");
  }
  return data;
}
