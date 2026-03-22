import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import generouted from "@generouted/react-router/plugin";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), generouted(), tsconfigPaths()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "vendor-chakra", test: /@chakra-ui|@emotion|@ark-ui|@pandacss|@zag-js/, priority: 20 },
            { name: "vendor-icons", test: /react-icons/, priority: 20 },
            { name: "vendor-map", test: /vietmap/, priority: 20 },
            { name: "vendor-markdown", test: /react-markdown|remark|rehype|mdast|micromark|unified|hast/, priority: 20 },
            { name: "vendor-auth", test: /@authgear/, priority: 20 },
            { name: "vendor-react", test: /node_modules\/(react|react-dom|react-router|scheduler)\//, priority: 10 },
          ],
        },
      },
    },
  },
});
