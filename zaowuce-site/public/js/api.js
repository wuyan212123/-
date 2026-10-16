export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let backend = null;
/** 演示版用内存中的模拟接口替换真实请求。 */
export function useBackend(fn) { backend = fn; }

export async function api(path, { method = 'GET', body } = {}) {
  if (backend) return backend(path, { method, body });
  let res;
  try {
    res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: { 'X-Zaowuce': '1', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError(0, 'network', '网络连接失败，请检查网络后重试');
  }
  let data = null;
  try { data = await res.json(); } catch { /* 非 JSON 响应 */ }
  if (!res.ok) throw new ApiError(res.status, data?.error || 'http_' + res.status, data?.message || `请求失败（${res.status}）`);
  return data;
}
