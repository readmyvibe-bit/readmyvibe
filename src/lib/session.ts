"use client";

function fallbackSessionId() {
  return `rvm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("readmyvibe_session");
  if (!sessionId) {
    const canUseRandomUuid =
      typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function";
    sessionId = canUseRandomUuid ? globalThis.crypto.randomUUID() : fallbackSessionId();
    localStorage.setItem("readmyvibe_session", sessionId);
  }
  return sessionId;
}
