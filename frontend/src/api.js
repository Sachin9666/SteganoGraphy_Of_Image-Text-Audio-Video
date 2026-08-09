import { API_BASE_URL } from "./config";

const AUTH_TOKEN_KEY = "stegano_access_token";
const USER_PROFILE_KEY = "stegano_user";

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_PROFILE_KEY);
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function submitForm(endpoint, formData) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
      headers: authHeaders(),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.detail || "Request failed");
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError || error.message?.toLowerCase().includes("fetch")) {
      throw new Error("Unable to connect to the backend server. Please make sure the backend is running on port 8000.");
    }
    throw error;
  }
}

async function requestJson(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.detail || "Request failed");
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError || error.message?.toLowerCase().includes("fetch")) {
      throw new Error("Unable to connect to the backend server. Please make sure the backend is running on port 8000.");
    }
    throw error;
  }
}

export function loginUser({ email, password }) {
  return requestJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser({ email, password }) {
  return requestJson("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchCurrentUser() {
  return requestJson("/auth/me", { method: "GET" });
}

export async function fetchMyJobs() {
  return requestJson("/jobs/me", { method: "GET" });
}

export async function clearMyJobs() {
  return requestJson("/jobs/me", { method: "DELETE" });
}

export function createEncodeJob({ modality, coverFile, secretFile, embeddingType }) {
  const formData = new FormData();
  formData.append("modality", modality);
  formData.append("cover_file", coverFile);
  formData.append("secret_file", secretFile);
  formData.append("embedding_type", embeddingType);
  return submitForm("/encode", formData);
}

export function createDecodeJob({ modality, stegoFile, accessKey, enhance }) {
  const formData = new FormData();
  formData.append("modality", modality);
  formData.append("stego_file", stegoFile);
  formData.append("access_key", accessKey);
  if (enhance !== undefined) {
    formData.append("enhance", enhance ? "true" : "false");
  }
  return submitForm("/decode", formData);
}

export async function fetchJob(jobId) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    headers: authHeaders(),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.detail || "Unable to load job");
  }
  return payload;
}

export async function downloadArtifact(jobId) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/artifact`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail || "Unable to download artifact");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
  const filename = filenameMatch ? filenameMatch[1] : `artifact-${jobId}`;
  return { blob, filename };
}

export function buildArtifactUrl(jobId) {
  return `${API_BASE_URL}/jobs/${jobId}/artifact`;
}

export async function fetchHealth() {
  const rootUrl = API_BASE_URL.endsWith("/api") ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
  const response = await fetch(`${rootUrl}/health`);
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json();
}

export async function fetchRecentJobs() {
  return requestJson("/jobs/me", { method: "GET" });
}

export async function fetchMetrics() {
  return requestJson("/jobs/metrics", { method: "GET" });
}


