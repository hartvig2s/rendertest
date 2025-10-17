import { describe, it, expect } from 'vitest';
import { ExportService } from '@/services/export-service';
import { ProjectService } from '@/services/project-service';
import { MotifService } from '@/services/motif-service';
import { PatternService } from '@/services/pattern-service';
import { ExportRequest } from '@/types/export';

describe('ExportService Contract Tests', () => {
  const exportService = new ExportService();
  const projectService = new ProjectService();
  const motifService = new MotifService();
  const patternService = new PatternService();

  describe('exportProject', () => {
    it('should export project as PDF with pattern and yarn calculation', async () => {
      // Create a complete project
      const project = await projectService.createProject({
        name: 'PDF Export Test',
        dimensions: { width: 30, height: 25 },
      });

      await motifService.placeMotif(project.id, {
        motifId: 'rose-flower',
        x: 10,
        y: 10,
        rotation: 0,
        flipped: false,
      });

      await patternService.generatePattern(project.id, {
        stitchInterpretation: 'black_filled',
      });

      const exportRequest: ExportRequest = {
        format: 'pdf',
        includeInstructions: true,
        includeYarnCalculation: true,
      };

      const result = await exportService.exportProject(project.id, exportRequest);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should export project as PNG image', async () => {
      const project = await projectService.createProject({
        name: 'PNG Export Test',
        dimensions: { width: 40, height: 30 },
      });

      await motifService.placeMotif(project.id, {
        motifId: 'small-bird',
        x: 15,
        y: 10,
        rotation: 0,
        flipped: false,
      });

      const exportRequest: ExportRequest = {
        format: 'png',
      };

      const result = await exportService.exportProject(project.id, exportRequest);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/png');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should export project as JSON for sharing', async () => {
      const project = await projectService.createProject({
        name: 'JSON Export Test',
        dimensions: { width: 35, height: 28 },
      });

      await motifService.placeMotif(project.id, {
        motifId: 'letter-a',
        x: 12,
        y: 14,
        rotation: 90,
        flipped: true,
      });

      const exportRequest: ExportRequest = {
        format: 'json',
      };

      const result = await exportService.exportProject(project.id, exportRequest);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/json');

      // Verify JSON content
      const jsonText = await result.text();
      const projectData = JSON.parse(jsonText);

      expect(projectData.name).toBe('JSON Export Test');
      expect(projectData.dimensions.width).toBe(35);
      expect(projectData.dimensions.height).toBe(28);
      expect(projectData.motifs).toHaveLength(1);
      expect(projectData.motifs[0].motifId).toBe('letter-a');
      expect(projectData.motifs[0].rotation).toBe(90);
      expect(projectData.motifs[0].flipped).toBe(true);
    });

    it('should export PDF without instructions when requested', async () => {
      const project = await projectService.createProject({
        name: 'No Instructions Test',
        dimensions: { width: 25, height: 25 },
      });

      await motifService.placeMotif(project.id, {
        motifId: 'rose-flower',
        x: 8,
        y: 8,
        rotation: 0,
        flipped: false,
      });

      await patternService.generatePattern(project.id, {
        stitchInterpretation: 'black_filled',
      });

      const exportRequest: ExportRequest = {
        format: 'pdf',
        includeInstructions: false,
        includeYarnCalculation: true,
      };

      const result = await exportService.exportProject(project.id, exportRequest);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      // Should be smaller without instructions
      expect(result.size).toBeGreaterThan(0);
    });

    it('should export PDF without yarn calculation when requested', async () => {
      const project = await projectService.createProject({
        name: 'No Yarn Calc Test',
        dimensions: { width: 25, height: 25 },
      });

      await motifService.placeMotif(project.id, {
        motifId: 'small-bird',
        x: 8,
        y: 8,
        rotation: 0,
        flipped: false,
      });

      await patternService.generatePattern(project.id, {
        stitchInterpretation: 'black_open',
      });

      const exportRequest: ExportRequest = {
        format: 'pdf',
        includeInstructions: true,
        includeYarnCalculation: false,
      };

      const result = await exportService.exportProject(project.id, exportRequest);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should throw error for non-existent project', async () => {
      const exportRequest: ExportRequest = {
        format: 'pdf',
      };

      await expect(
        exportService.exportProject('non-existent-project', exportRequest)
      ).rejects.toThrow('Project not found');
    });

    it('should throw error for unsupported export format', async () => {
      const project = await projectService.createProject({
        name: 'Invalid Format Test',
        dimensions: { width: 30, height: 20 },
      });

      const exportRequest = {
        format: 'svg', // Not supported
      } as ExportRequest;

      await expect(
        exportService.exportProject(project.id, exportRequest)
      ).rejects.toThrow('Unsupported export format: svg');
    });

    it('should handle empty project export', async () => {
      const project = await projectService.createProject({
        name: 'Empty Project Export',
        dimensions: { width: 20, height: 20 },
      });

      const exportRequest: ExportRequest = {
        format: 'pdf',
        includeInstructions: true,
        includeYarnCalculation: true,
      };

      const result = await exportService.exportProject(project.id, exportRequest);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should include project metadata in exports', async () => {
      const project = await projectService.createProject({
        name: 'Metadata Test Project',
        dimensions: { width: 40, height: 35 },
      });

      await motifService.placeMotif(project.id, {
        motifId: 'rose-flower',
        x: 15,
        y: 15,
        rotation: 0,
        flipped: false,
      });

      // Test JSON export for metadata verification
      const jsonRequest: ExportRequest = {
        format: 'json',
      };

      const result = await exportService.exportProject(project.id, jsonRequest);
      const jsonText = await result.text();
      const projectData = JSON.parse(jsonText);

      expect(projectData.id).toBe(project.id);
      expect(projectData.name).toBe('Metadata Test Project');
      expect(projectData.createdAt).toBeDefined();
      expect(projectData.updatedAt).toBeDefined();
      expect(projectData.dimensions).toEqual({ width: 40, height: 35 });
    });
  });
});