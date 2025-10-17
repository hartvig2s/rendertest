import { describe, it, expect } from 'vitest';
import { YarnService } from '@/services/yarn-service';
import { ProjectService } from '@/services/project-service';
import { MotifService } from '@/services/motif-service';
import { PatternService } from '@/services/pattern-service';

describe('YarnService Contract Tests', () => {
  const yarnService = new YarnService();
  const projectService = new ProjectService();
  const motifService = new MotifService();
  const patternService = new PatternService();

  describe('calculateYarn', () => {
    it('should calculate yarn requirements for empty grid', async () => {
      const project = await projectService.createProject({
        name: 'Empty Grid Test',
        dimensions: { width: 20, height: 20 },
      });

      const yarnCalculation = await yarnService.calculateYarn(project.id);

      expect(yarnCalculation).toBeDefined();
      expect(yarnCalculation.totalStitches).toBe(400); // 20 * 20
      expect(yarnCalculation.yarnLength).toBe(1600); // 400 * 4cm per stitch
      expect(yarnCalculation.skeinsNeeded).toBe(1); // Math.ceil(1600 / 7500) = 1
      expect(yarnCalculation.calculatedAt).toBeInstanceOf(Date);
      expect(yarnCalculation.formula.stitchLength).toBe(4);
      expect(yarnCalculation.formula.skeinLength).toBe(7500);
    });

    it('should calculate yarn for project with motifs', async () => {
      const project = await projectService.createProject({
        name: 'Motif Yarn Test',
        dimensions: { width: 30, height: 25 },
      });

      // Place some motifs
      await motifService.placeMotif(project.id, {
        motifId: 'rose-flower',
        x: 5,
        y: 5,
        rotation: 0,
        flipped: false,
      });

      await motifService.placeMotif(project.id, {
        motifId: 'small-bird',
        x: 20,
        y: 15,
        rotation: 0,
        flipped: false,
      });

      const yarnCalculation = await yarnService.calculateYarn(project.id);

      expect(yarnCalculation.totalStitches).toBe(750); // 30 * 25
      expect(yarnCalculation.yarnLength).toBe(3000); // 750 * 4cm
      expect(yarnCalculation.skeinsNeeded).toBe(1); // Math.ceil(3000 / 7500) = 1
    });

    it('should calculate multiple skeins for large projects', async () => {
      const project = await projectService.createProject({
        name: 'Large Project',
        dimensions: { width: 150, height: 150 },
      });

      const yarnCalculation = await yarnService.calculateYarn(project.id);

      expect(yarnCalculation.totalStitches).toBe(22500); // 150 * 150
      expect(yarnCalculation.yarnLength).toBe(90000); // 22500 * 4cm
      expect(yarnCalculation.skeinsNeeded).toBe(12); // Math.ceil(90000 / 7500) = 12
    });

    it('should round up skeins needed (no partial skeins)', async () => {
      // Create a project that needs 1.1 skeins
      const project = await projectService.createProject({
        name: 'Partial Skein Test',
        dimensions: { width: 50, height: 40 },
      });

      const yarnCalculation = await yarnService.calculateYarn(project.id);

      expect(yarnCalculation.totalStitches).toBe(2000); // 50 * 40
      expect(yarnCalculation.yarnLength).toBe(8000); // 2000 * 4cm
      expect(yarnCalculation.skeinsNeeded).toBe(2); // Math.ceil(8000 / 7500) = 2
    });

    it('should work with different stitch interpretations', async () => {
      const project = await projectService.createProject({
        name: 'Interpretation Test',
        dimensions: { width: 25, height: 25 },
      });

      await motifService.placeMotif(project.id, {
        motifId: 'rose-flower',
        x: 10,
        y: 10,
        rotation: 0,
        flipped: false,
      });

      // Calculate yarn should work regardless of stitch interpretation
      // because total stitches is always the same (grid area)
      const yarnCalculation = await yarnService.calculateYarn(project.id);

      expect(yarnCalculation.totalStitches).toBe(625); // 25 * 25
      expect(yarnCalculation.yarnLength).toBe(2500); // 625 * 4cm
      expect(yarnCalculation.skeinsNeeded).toBe(1); // Math.ceil(2500 / 7500) = 1
    });

    it('should throw error for non-existent project', async () => {
      await expect(
        yarnService.calculateYarn('non-existent-project')
      ).rejects.toThrow('Project not found');
    });

    it('should include formula details in calculation', async () => {
      const project = await projectService.createProject({
        name: 'Formula Test',
        dimensions: { width: 30, height: 20 },
      });

      const yarnCalculation = await yarnService.calculateYarn(project.id);

      expect(yarnCalculation.formula).toBeDefined();
      expect(yarnCalculation.formula.stitchLength).toBe(4); // 4cm per stitch
      expect(yarnCalculation.formula.skeinLength).toBe(7500); // 75m = 7500cm per skein
    });

    it('should handle minimum project size correctly', async () => {
      const project = await projectService.createProject({
        name: 'Minimum Size',
        dimensions: { width: 20, height: 20 },
      });

      const yarnCalculation = await yarnService.calculateYarn(project.id);

      expect(yarnCalculation.totalStitches).toBe(400); // 20 * 20
      expect(yarnCalculation.yarnLength).toBe(1600); // 400 * 4cm
      expect(yarnCalculation.skeinsNeeded).toBe(1); // Math.ceil(1600 / 7500) = 1
    });

    it('should handle maximum project size correctly', async () => {
      const project = await projectService.createProject({
        name: 'Maximum Size',
        dimensions: { width: 200, height: 200 },
      });

      const yarnCalculation = await yarnService.calculateYarn(project.id);

      expect(yarnCalculation.totalStitches).toBe(40000); // 200 * 200
      expect(yarnCalculation.yarnLength).toBe(160000); // 40000 * 4cm
      expect(yarnCalculation.skeinsNeeded).toBe(22); // Math.ceil(160000 / 7500) = 22
    });
  });
});