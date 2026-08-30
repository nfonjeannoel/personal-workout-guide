"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let timeout: number | undefined;
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((registration) => {
      timeout = window.setTimeout(() => {
        (registration.active ?? registration.waiting)?.postMessage("CACHE_COMPLETE_GUIDE");
      }, 15_000);
    });
    return () => window.clearTimeout(timeout);
  }, []);
  return null;
}
