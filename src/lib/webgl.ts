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

function checkWebGL(): boolean {
  if (typeof window === "undefined") return false;
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
    return supported;
  } catch {
    return false;
  }
}

export function useWebGLSupport(): boolean {
  return useSyncExternalStore(subscribe, checkWebGL, () => false);
}

export function hasWebGL(): boolean {
  return checkWebGL();
}
