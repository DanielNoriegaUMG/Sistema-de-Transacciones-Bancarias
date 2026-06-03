const API_ROOT = "/api";

const parseJSON = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("banco_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_ROOT}${path}`, {
    credentials: "same-origin",
    ...options,
    headers,
  });

  const payload = await parseJSON(response);

  if (!response.ok) {
    const error = new Error(payload?.message || response.statusText || "Error de API");
    error.status = response.status;
    error.payload = payload;
    error.unauthorized = response.status === 401;
    throw error;
  }

  return payload;
}

export async function apiGet(path, options = {}) {
  return apiFetch(path, { method: "GET", ...options });
}

export async function apiPost(path, body, options = {}) {
  return apiFetch(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });
}
