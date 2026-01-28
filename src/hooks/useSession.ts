"use client";

import { useState, useEffect } from "react";

const SESSION_KEY = "shopbuddy_session_id";

function generateSessionId(): string {
  return "sb_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for existing session
    let storedSession = localStorage.getItem(SESSION_KEY);
    
    if (!storedSession) {
      // Generate new session ID
      storedSession = generateSessionId();
      localStorage.setItem(SESSION_KEY, storedSession);
    }
    
    setSessionId(storedSession);
  }, []);

  const clearSession = () => {
    const newSession = generateSessionId();
    localStorage.setItem(SESSION_KEY, newSession);
    setSessionId(newSession);
  };

  return { sessionId, clearSession };
}
