import { fileURLToPath } from "node:url";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const base = env.VITE_BASE_PATH || "/";
  return {
    plugins: [react()],
    base: base,
    assetsInclude: ["**/*.PNG"],
  };
});
