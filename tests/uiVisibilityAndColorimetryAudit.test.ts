import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

describe('Auditoría Permanente de Visibilidad de UI y Colorimetría WCAG 2.2 AA', () => {
  it('globals.css importa landing.css para que Tailwind v4 emita todos los tokens --color-lp-* y --font-lp-*', () => {
    const globalsCss = fs.readFileSync(path.join(ROOT, 'src/app/globals.css'), 'utf-8');
    expect(globalsCss).toContain('@import "../components/landing/landing.css";');

    const landingCss = fs.readFileSync(path.join(ROOT, 'src/components/landing/landing.css'), 'utf-8');
    const requiredTokens = [
      '--color-lp-navy:',
      '--color-lp-navy-deep:',
      '--color-lp-blue:',
      '--color-lp-violet:',
      '--color-lp-mist:',
      '--font-lp-display:',
      '--font-lp-body:',
    ];
    for (const token of requiredTokens) {
      expect(landingCss).toContain(token);
    }
  });

  it('landing.css no atrapa secciones .lp-reveal en opacity: 0 con animation-timeline: view()', () => {
    const landingCss = fs.readFileSync(path.join(ROOT, 'src/components/landing/landing.css'), 'utf-8');
    expect(landingCss).not.toMatch(/animation-timeline:\s*view\(\)/);
    expect(landingCss).toMatch(/\.lp-reveal\s*\{[^}]*opacity:\s*1;/);
  });

  it('los botones y componentes críticos auditados cumplen contraste WCAG 2.2 AA (sin bg-emerald-500/amber-500 con text-white)', () => {
    const auditedFiles = [
      'src/app/teacher/idiomas/page.tsx',
      'src/app/student/page.tsx',
      'src/app/student/shop/page.tsx',
      'src/components/QuestCard.tsx',
      'src/components/AvatarCustomizer.tsx',
      'src/components/StudioTriviaPlayer.tsx',
      'src/components/TeacherCommunityView.tsx',
      'src/components/ergonomics/StudentMissionFocusBanner.tsx',
      'src/components/ergonomics/SuperUserFourQuadrantCockpit.tsx',
      'src/components/admin/SuperUserCommandCenter.tsx',
      'src/components/languages/LanguageKaraokePlayer.tsx',
    ];
    const forbiddenPatterns = [
      /(?<![:\w/-])bg-emerald-500(?![/\w-])[^"'`\n]*\btext-white\b/,
      /\btext-white\b[^"'`\n]*(?<![:\w/-])bg-emerald-500(?![/\w-])/,
      /(?<![:\w/-])bg-amber-500(?![/\w-])[^"'`\n]*\btext-white\b/,
      /\btext-white\b[^"'`\n]*(?<![:\w/-])bg-amber-500(?![/\w-])/,
    ];

    const violations: string[] = [];
    for (const rel of auditedFiles) {
      const file = path.join(ROOT, rel);
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        for (const pattern of forbiddenPatterns) {
          if (pattern.test(line)) {
            violations.push(`${rel}:${idx + 1}: ${line.trim()}`);
          }
        }
      });
    }

    expect(violations).toEqual([]);
  });
});
