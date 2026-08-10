import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Extension `.mts` et non `.ts` : Vitest charge une config `.ts` via `require`,
// ce qui casse dès qu'une dépendance de la config est publiée en ESM pur.
// Corollaire : `__dirname` n'existe pas en module ES, d'où le calcul ci-dessous.
//
// Pas de `@vitejs/plugin-react` : la suite ne contient aucun test de composant
// (aucun fichier `.test.tsx`), le plugin n'avait donc rien à transformer tout en
// tirant vite/esbuild/@babel/core — et leurs failles — dans l'arbre. À réinstaller
// (`pnpm add -D @vitejs/plugin-react`) le jour où l'on testera du JSX rendu.
const racine = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": racine,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.{test,spec}.{ts,tsx}", "**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "dist", "build", "e2e", "supabase/functions"],
  },
});
