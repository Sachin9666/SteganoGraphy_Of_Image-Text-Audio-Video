import { API_BASE_URL } from "./config";

async function submitForm(endpoint, formData) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.detail || "Request failed");
  }

  return payload;
}

export function createEncodeJob({ modality, coverFile, secretFile, embeddingType }) {
  const formData = new FormData();
  formData.append("modality", modality);
  formData.append("cover_file", coverFile);
  formData.append("secret_file", secretFile);
  formData.append("embedding_type", embeddingType);
  return submitForm("/encode", formData);
}

export function createDecodeJob({ modality, stegoFile, accessKey }) {
  const formData = new FormData();
  formData.append("modality", modality);
  formData.append("stego_file", stegoFile);
  formData.append("access_key", accessKey);
  return submitForm("/decode", formData);
}

export async function fetchJob(jobId) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.detail || "Unable to load job");
  }
  return payload;
}

export function buildArtifactUrl(jobId) {
  return `${API_BASE_URL}/jobs/${jobId}/artifact`;
}
