import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
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
    "sync-obsidian.js",
    "capture_presentation_screens.js",
    "generate_lms_manual_pdf.js",
    "generate_pitch_presentation_pdf.js",
    "render_mp4.js",
  ]),
]);

export default eslintConfig;
