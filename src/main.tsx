import { Routes } from "@generouted/react-router";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "./components/ui/provider";
import { Toaster } from "./components/ui/toaster";
import authgear from "@authgear/web";

function TokenRefresher() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        authgear.refreshAccessTokenIfNeeded().catch(() => {});
      }, 500);
    };
    const events = ["click", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, refresh, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, refresh));
    };
  }, []);
  return null;
}

async function init(): Promise<void> {
  try {
    await authgear.configure({
      endpoint: import.meta.env.VITE_AUTHGEAR_ENDPOINT,
      clientID: import.meta.env.VITE_AUTHGEAR_CLIENT_ID,
      sessionType: "refresh_token",
    });

    await authgear.refreshAccessTokenIfNeeded();
  } finally {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <Provider>
          <Toaster />
          <TokenRefresher />
          <Routes />
        </Provider>
      </StrictMode>,
    );
  }
}

try {
  await init();
} catch (error) {
  console.error(error);
}