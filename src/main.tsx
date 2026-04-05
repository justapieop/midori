import { Routes } from "@generouted/react-router";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "./components/ui/provider";
import { Toaster } from "./components/ui/toaster";
import authgear from "@authgear/web";
import { BASE_URL } from "./api/utils";

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

function renderError() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.08); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #071a0f, #0f2e1a, #132a16)",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          color: "#fff",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            animation: "fadeIn 0.6s ease-out",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.25rem",
            maxWidth: "420px",
          }}
        >
          <div
            style={{
              fontSize: "4rem",
              animation: "pulse 2.5s ease-in-out infinite",
              filter: "drop-shadow(0 0 24px rgba(34, 197, 94, 0.5))",
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              margin: 0,
              background: "linear-gradient(90deg, #4ade80, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Không thể kết nối máy chủ
          </h1>
          <p
            style={{
              color: "#a0aec0",
              fontSize: "1rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Hệ thống hiện không phản hồi. Vui lòng kiểm tra kết nối mạng hoặc
            thử lại sau.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "0.75rem",
              padding: "0.65rem 2rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              border: "none",
              borderRadius: "9999px",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 20px rgba(22, 163, 74, 0.4)",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "0 6px 28px rgba(22, 163, 74, 0.6)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = "scale(1)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "0 4px 20px rgba(22, 163, 74, 0.4)";
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    </StrictMode>,
  );
}

async function init(): Promise<void> {
  // Health check: ping the backend root route
  try {
    const res = await fetch(BASE_URL);
    if (res.status !== 200) {
      renderError();
      return;
    }
  } catch {
    renderError();
    return;
  }

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