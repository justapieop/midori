import { Routes } from "@generouted/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "./components/ui/provider";
import authgear from "@authgear/web";
import { CookiesProvider } from "react-cookie";

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
          <CookiesProvider>
            <Routes />
          </CookiesProvider>
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