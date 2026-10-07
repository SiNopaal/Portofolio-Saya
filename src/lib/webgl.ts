"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("webglcontextlost", callback);
  window.addEventListener("webglcontextrestored", callback);
  return () => {
    window.removeEventListener("webglcontextlost", callback);
    window.removeEventListener("webglcontextrestored", callback);
  };
}

let cachedWebGLSupport: boolean | null = null;

function checkWebGL(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    const supported = !!gl;
    if (gl) {
      const loseExt = (gl as WebGLRenderingContext).getExtension?.("WEBGL_lose_context");
      loseExt?.loseContext();
    }
    cachedWebGLSupport = supported;
    return supported;
  } catch {
    cachedWebGLSupport = false;
    return false;
  }
}

export function useWebGLSupport(): boolean {
  return useSyncExternalStore(subscribe, checkWebGL, () => false);
}

export function hasWebGL(): boolean {
  return checkWebGL();
}
