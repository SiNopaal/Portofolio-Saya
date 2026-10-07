"use client";

export function safeGetLocalStorage(key: string, fallback: string | null = null): string | null {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeSetLocalStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore SecurityError or QuotaExceededError in Private / WebView modes
  }
}

export function safeGetSessionStorage(key: string, fallback: string | null = null): string | null {
  if (typeof window === "undefined") return fallback;
  try {
    return window.sessionStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeSetSessionStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ignore SecurityError or QuotaExceededError in Private / WebView modes
  }
}
