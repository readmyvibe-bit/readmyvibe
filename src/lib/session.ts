"use client";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("readmyvibe_session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("readmyvibe_session", sessionId);
  }
  return sessionId;
}
