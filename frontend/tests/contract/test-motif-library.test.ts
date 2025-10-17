import { describe, it, expect } from 'vitest';
import { MotifLibraryService } from '@/services/motif-library-service';
import { MotifCategory } from '@/types/motif';

describe('MotifLibraryService Contract Tests', () => {
  const motifLibraryService = new MotifLibraryService();

  describe('getMotifs', () => {
    it('should return all available motifs when no category filter', async () => {
      const motifs = await motifLibraryService.getMotifs();

      expect(motifs).toBeDefined();
      expect(Array.isArray(motifs)).toBe(true);
      expect(motifs.length).toBeGreaterThan(0);

      // Verify motif structure
      const firstMotif = motifs[0];
      expect(firstMotif.id).toBeDefined();
      expect(firstMotif.name).toBeDefined();
      expect(firstMotif.category).toBeDefined();
      expect(firstMotif.pattern).toBeDefined();
      expect(firstMotif.width).toBeGreaterThan(0);
      expect(firstMotif.height).toBeGreaterThan(0);
      expect(firstMotif.previewImage).toBeDefined();
    });

    it('should return flower motifs when filtered by flower category', async () => {
      const flowerMotifs = await motifLibraryService.getMotifs('flower');

      expect(flowerMotifs).toBeDefined();
      expect(Array.isArray(flowerMotifs)).toBe(true);
      expect(flowerMotifs.length).toBeGreaterThan(0);

      // All returned motifs should be flowers
      flowerMotifs.forEach((motif) => {
        expect(motif.category).toBe('flower');
        expect(motif.name).toBeDefined();
        expect(['rose', 'daisy', 'tulip', 'sunflower']).toContainEqual(
          expect.stringContaining(motif.name.toLowerCase())
        );
      });
    });

    it('should return bird motifs when filtered by bird category', async () => {
      const birdMotifs = await motifLibraryService.getMotifs('bird');

      expect(birdMotifs).toBeDefined();
      expect(Array.isArray(birdMotifs)).toBe(true);
      expect(birdMotifs.length).toBeGreaterThan(0);

      birdMotifs.forEach((motif) => {
        expect(motif.category).toBe('bird');
        expect(['bird', 'eagle', 'dove', 'swan', 'hummingbird']).toContainEqual(
          expect.stringContaining(motif.name.toLowerCase())
        );
      });
    });

    it('should return letter motifs when filtered by letter category', async () => {
      const letterMotifs = await motifLibraryService.getMotifs('letter');

      expect(letterMotifs).toBeDefined();
      expect(Array.isArray(letterMotifs)).toBe(true);
      expect(letterMotifs.length).toBeGreaterThanOrEqual(26); // At least A-Z

      letterMotifs.forEach((motif) => {
        expect(motif.category).toBe('letter');
        expect(motif.name).toMatch(/^(Letter\s)?[A-Z]$/); // "A" or "Letter A"
      });

      // Should have all letters A-Z
      const letterNames = letterMotifs.map((m) => m.name.slice(-1));
      expect(letterNames).toContain('A');
      expect(letterNames).toContain('Z');
    });

    it('should return geometric motifs when filtered by geometric category', async () => {
      const geometricMotifs = await motifLibraryService.getMotifs('geometric');

      expect(geometricMotifs).toBeDefined();
      expect(Array.isArray(geometricMotifs)).toBe(true);
      expect(geometricMotifs.length).toBeGreaterThan(0);

      geometricMotifs.forEach((motif) => {
        expect(motif.category).toBe('geometric');
        expect(['circle', 'square', 'triangle', 'diamond', 'star']).toContainEqual(
          expect.stringContaining(motif.name.toLowerCase())
        );
      });
    });

    it('should return empty array for non-existent category', async () => {
      const invalidMotifs = await motifLibraryService.getMotifs(
        'invalid' as MotifCategory
      );

      expect(invalidMotifs).toBeDefined();
      expect(Array.isArray(invalidMotifs)).toBe(true);
      expect(invalidMotifs.length).toBe(0);
    });

    it('should have motifs with valid pattern dimensions', async () => {
      const motifs = await motifLibraryService.getMotifs();

      motifs.forEach((motif) => {
        expect(motif.pattern).toBeDefined();
        expect(Array.isArray(motif.pattern)).toBe(true);
        expect(motif.pattern.length).toBe(motif.height);

        // Check each row has correct width
        motif.pattern.forEach((row) => {
          expect(Array.isArray(row)).toBe(true);
          expect(row.length).toBe(motif.width);
          // Each cell should be a boolean
          row.forEach((cell) => {
            expect(typeof cell).toBe('boolean');
          });
        });
      });
    });

    it('should have motifs with valid preview images', async () => {
      const motifs = await motifLibraryService.getMotifs();

      motifs.forEach((motif) => {
        expect(motif.previewImage).toBeDefined();
        expect(typeof motif.previewImage).toBe('string');
        expect(motif.previewImage.length).toBeGreaterThan(0);

        // Should be base64 data URL or valid URL
        const isBase64 = motif.previewImage.startsWith('data:image/');
        const isUrl = motif.previewImage.startsWith('http');
        expect(isBase64 || isUrl).toBe(true);
      });
    });

    it('should have reasonable motif sizes for grid placement', async () => {
      const motifs = await motifLibraryService.getMotifs();

      motifs.forEach((motif) => {
        // Motifs should be reasonable size for grids (1-50 cells)
        expect(motif.width).toBeGreaterThanOrEqual(1);
        expect(motif.width).toBeLessThanOrEqual(50);
        expect(motif.height).toBeGreaterThanOrEqual(1);
        expect(motif.height).toBeLessThanOrEqual(50);

        // Area should be reasonable (not too large for performance)
        const area = motif.width * motif.height;
        expect(area).toBeLessThanOrEqual(400); // Max 20x20
      });
    });

    it('should maintain consistent motif IDs across calls', async () => {
      const motifs1 = await motifLibraryService.getMotifs();
      const motifs2 = await motifLibraryService.getMotifs();

      expect(motifs1.length).toBe(motifs2.length);

      const ids1 = motifs1.map((m) => m.id).sort();
      const ids2 = motifs2.map((m) => m.id).sort();

      expect(ids1).toEqual(ids2);
    });

    it('should have unique motif IDs', async () => {
      const motifs = await motifLibraryService.getMotifs();
      const ids = motifs.map((m) => m.id);
      const uniqueIds = [...new Set(ids)];

      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should include a variety of motif sizes', async () => {
      const motifs = await motifLibraryService.getMotifs();

      // Should have small motifs (< 10x10)
      const smallMotifs = motifs.filter((m) => m.width < 10 && m.height < 10);
      expect(smallMotifs.length).toBeGreaterThan(0);

      // Should have medium motifs (10-20 cells)
      const mediumMotifs = motifs.filter((m) =>
        (m.width >= 10 || m.height >= 10) &&
        (m.width <= 20 && m.height <= 20)
      );
      expect(mediumMotifs.length).toBeGreaterThan(0);
    });
  });
});