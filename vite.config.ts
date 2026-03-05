import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import generouted from "@generouted/react-router/plugin";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), generouted(), tsconfigPaths()],
  server: {
    allowedHosts: ["13df-2405-4803-fdca-6f20-8881-ca13-bef3-719a.ngrok-free.app"]
  }
});
