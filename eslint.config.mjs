import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Reglas de calidad de código y tipado pragmáticas
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/syntax": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/refs": "warn",
      "react/no-unescaped-entities": "off",
      "prefer-const": "warn",
      "no-var": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "public/**",
    "supabase/**",
    "coverage/**",
    "next-env.d.ts",
    "*.html",
    "*.mp4",
    "*.pdf",
    "*.wav",
    "*.canvas",
    "presentation_screenshots/**",
    "verify_frames_v3_1/**",
    ".obsidian/**",
    "planeaciones/**",
    "scripts/**",
    "tests/**",
    "__tests__/**",
    "test_*.ts",
    "sync-obsidian.js",
    "capture_presentation_screens.js",
    "generate_lms_manual_pdf.js",
    "generate_pitch_presentation_pdf.js",
    "render_mp4.js",
    "*.js",
  ]),
]);

export default eslintConfig;
