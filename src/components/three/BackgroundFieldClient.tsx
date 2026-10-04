"use client";

import dynamic from "next/dynamic";

const BackgroundFieldInner = dynamic(
  () => import("@/components/three/BackgroundField"),
  { ssr: false }
);

export function BackgroundFieldClient() {
  return <BackgroundFieldInner />;
}
