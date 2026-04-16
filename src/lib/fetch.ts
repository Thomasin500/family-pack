export class ApiResponseError extends Error {
  status: number;
  [key: string]: unknown;

  constructor(status: number, body: Record<string, unknown>) {
    super((body.error as string) || "Request failed");
    this.status = status;
    Object.assign(this, body);
  }
}

export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new ApiResponseError(res.status, body);
  }
  return res.json();
}
