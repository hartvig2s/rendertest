import { describe, it, expect } from 'vitest';
import { PatternService } from '@/services/pattern-service';
import { ProjectService } from '@/services/project-service';
import { MotifService } from '@/services/motif-service';
import { GeneratePatternRequest } from '@/types/pattern';

describe('PatternService Contract Tests', () => {
  const patternService = new PatternService();
  const projectService = new ProjectService();
  const motifService = new MotifService();

  describe('generatePattern', () => {
    it('should generate pattern with black_filled interpretation', async () => {
      // Create project with motifs
      const project = await projectService.createProject({
        name: 'Pattern Test',
        dimensions: { width: 30, height: 20 },
      });

      await motifService.placeMotif(project.id, {
        motifId: 'rose-flower',
        x: 10,
        y: 5,
        rotation: 0,
        flipped: false,
      });

      const request: GeneratePatternRequest = {
        stitchInterpretation: 'black_filled',
      };

      const pattern = await patternService.generatePattern(project.id, request);

      expect(pattern).toBeDefined();
      expect(pattern.id).toBeDefined();
      expect(pattern.chart).toBeDefined();
      expect(pattern.chart.stitchInterpretation).toBe('black_filled');
      expect(pattern.chart.rows).toHaveLength(20); // Height of grid
      expect(pattern.chart.rows[0].stitches).toHaveLength(30); // Width of grid
      expect(pattern.instructions).toBeDefined();
      expect(pattern.instructions.length).toBeGreaterThan(0);
      expect(pattern.stitchCount.total).toBe(600); // 30 * 20
      expect(pattern.stitchCount.filled + pattern.stitchCount.open).toBe(600);
      expect(pattern.generatedAt).toBeInstanceOf(Date);
      expect(pattern.version).toBe(1);
    });

    it('should generate pattern with black_open interpretation', async () => {
      const project = await projectService.createProject({
        name: 'Open Stitch Test',
        dimensions: { width: 25, height: 25 },
      });

      await motifService.placeMotif(project.id, {
        motifId: 'small-bird',
        x: 10,
        y: 10,
        rotation: 0,
        flipped: false,
      });

      const request: GeneratePatternRequest = {
        stitchInterpretation: 'black_open',
      };

      const pattern = await patternService.generatePattern(project.id, request);

      expect(pattern.chart.stitchInterpretation).toBe('black_open');
      expect(pattern.stitchCount.total).toBe(625); // 25 * 25

      // With black_open interpretation, black motif areas should be open stitches
      const motifRow = pattern.chart.rows.find(row =>
        row.stitches.some(stitch => stitch === 'open')
      );
      expect(motifRow).toBeDefined();
    });

    it('should generate row-by-row instructions', async () => {
      const project = await projectService.createProject({
        name: 'Instructions Test',
        dimensions: { width: 20, height: 15 },
      });

      const pattern = await patternService.generatePattern(project.id, {
        stitchInterpretation: 'black_filled',
      });

      expect(pattern.instructions).toHaveLength(15); // One instruction per row
      expect(pattern.instructions[0]).toContain('Row 1');
      expect(pattern.instructions[14]).toContain('Row 15');

      // Instructions should contain stitch descriptions
      const hasStitchInstructions = pattern.instructions.some(instruction =>
        instruction.includes('dc') || instruction.includes('ch') ||
        instruction.includes('double crochet') || instruction.includes('chain')
      );
      expect(hasStitchInstructions).toBe(true);
    });

    it('should handle pattern regeneration with version increment', async () => {
      const project = await projectService.createProject({
        name: 'Version Test',
        dimensions: { width: 30, height: 20 },
      });

      // Generate first pattern
      const pattern1 = await patternService.generatePattern(project.id, {
        stitchInterpretation: 'black_filled',
      });
      expect(pattern1.version).toBe(1);

      // Add a motif and regenerate
      await motifService.placeMotif(project.id, {
        motifId: 'letter-a',
        x: 15,
        y: 10,
        rotation: 0,
        flipped: false,
      });

      const pattern2 = await patternService.generatePattern(project.id, {
        stitchInterpretation: 'black_filled',
      });
      expect(pattern2.version).toBe(2);
      expect(pattern2.stitchCount.filled).toBeGreaterThan(pattern1.stitchCount.filled);
    });

    it('should throw error for project with no motifs placed', async () => {
      const project = await projectService.createProject({
        name: 'Empty Project',
        dimensions: { width: 30, height: 20 },
      });

      await expect(
        patternService.generatePattern(project.id, {
          stitchInterpretation: 'black_filled',
        })
      ).rejects.toThrow('Cannot generate pattern: no motifs placed');
    });

    it('should throw error for non-existent project', async () => {
      await expect(
        patternService.generatePattern('non-existent-project', {
          stitchInterpretation: 'black_filled',
        })
      ).rejects.toThrow('Project not found');
    });

    it('should include chart legend', async () => {
      const project = await projectService.createProject({
        name: 'Legend Test',
        dimensions: { width: 20, height: 20 },
      });

      await motifService.placeMotif(project.id, {
        motifId: 'rose-flower',
        x: 5,
        y: 5,
        rotation: 0,
        flipped: false,
      });

      const pattern = await patternService.generatePattern(project.id, {
        stitchInterpretation: 'black_filled',
      });

      expect(pattern.chart.legend).toBeDefined();
      expect(pattern.chart.legend.filledSymbol).toBeDefined();
      expect(pattern.chart.legend.openSymbol).toBeDefined();
      expect(pattern.chart.legend.filledSymbol).not.toBe(pattern.chart.legend.openSymbol);
    });
  });
});