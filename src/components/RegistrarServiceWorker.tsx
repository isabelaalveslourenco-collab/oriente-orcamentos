"use client";

import { useEffect } from "react";

export default function RegistrarServiceWorker() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((erro) => {
        console.warn("Falha ao registrar service worker:", erro);
      });
    }
  }, []);

  return null;
}
