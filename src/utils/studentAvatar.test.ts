import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { DETAILED_STUDENTS_SEED } from '@/store/seeds';
import { getStudentAvatarUrl } from './studentAvatar';

describe('Student Archive Portrait System (Age, Gender & Non-Repeating)', () => {
  it('assigns a unique, non-repeating local WebP archive portrait (< 300KB) to every student in DETAILED_STUDENTS_SEED', () => {
    const seenUrls = new Set<string>();

    for (const student of DETAILED_STUDENTS_SEED) {
      const url = getStudentAvatarUrl(student);
      expect(url).toMatch(/^\/images\/students\/archive\/[a-z_]+_\d{2}\.webp$/);
      expect(student.photo_url).toBe(url);

      // Verify zero repetition across the entire student roster
      expect(seenUrls.has(url)).toBe(false);
      seenUrls.add(url);

      // Verify file exists on disk and complies with Regla No Negociable 3 (< 300KB WebP)
      const fullPath = path.join(process.cwd(), 'public', url);
      expect(fs.existsSync(fullPath)).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(1000);
      expect(stat.size).toBeLessThan(300 * 1024);
    }

    expect(seenUrls.size).toBe(DETAILED_STUDENTS_SEED.length);
  });

  it('strictly matches each student gender and educational age bracket', () => {
    for (const student of DETAILED_STUDENTS_SEED) {
      const url = getStudentAvatarUrl(student);
      const isFemale = student.gender === 'Femenino';
      const isCorporate = Boolean(student.school_id?.startsWith('emp-'));

      if (isCorporate) {
        expect(url).toContain(isFemale ? 'corporativo_woman_' : 'corporativo_man_');
      } else if (student.level === 'preparatoria') {
        expect(url).toContain(isFemale ? 'preparatoria_girl_' : 'preparatoria_boy_');
      } else if (student.level === 'secundaria') {
        expect(url).toContain(isFemale ? 'secundaria_girl_' : 'secundaria_boy_');
      } else {
        expect(url).toContain(isFemale ? 'primaria_girl_' : 'primaria_boy_');
      }
    }
  });
});

