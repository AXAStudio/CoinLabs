import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // Allow Vite preview to accept the Render hostname used at runtime
  // This prevents the "host not allowed" error when the preview server
  // receives requests for coinlabs-web.onrender.com
  preview: {
    // bind to all interfaces so Render can route traffic
    host: true,
    // explicitly allow the Render hostname
    allowedHosts: ["coinlabs-web.onrender.com"],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
