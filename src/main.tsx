import { Routes } from "@generouted/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "./components/ui/provider";
import authgear from "@authgear/web";

async function init(): Promise<void> {
  try {
    await authgear.configure({
      endpoint: import.meta.env.VITE_AUTHGEAR_ENDPOINT,
      clientID: import.meta.env.VITE_AUTHGEAR_CLIENT_ID,
      sessionType: "refresh_token",
    });
  } finally {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <Provider>
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