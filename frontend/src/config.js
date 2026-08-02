export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const FILE_LIMITS = {
  image: 100 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  text: 2 * 1024 * 1024,
};

export const SECRET_LIMITS = {
  image: 100 * 1024 * 1024,
  audio: 4 * 1024 * 1024,
  video: 8 * 1024 * 1024,
  text: 256 * 1024,
};

