import { describe, it, expect } from 'vitest';
import { MotifService } from '@/services/motif-service';
import { ProjectService } from '@/services/project-service';
import { PlaceMotifRequest, PlacedMotif } from '@/types/motif';

describe('MotifService Contract Tests', () => {
  const motifService = new MotifService();
  const projectService = new ProjectService();

  describe('placeMotif', () => {
    it('should place a motif on the grid successfully', async () => {
      // Create a project first
      const project = await projectService.createProject({
        name: 'Test Project',
        dimensions: { width: 50, height: 40 },
      });

      const request: PlaceMotifRequest = {
        motifId: 'rose-flower',
        x: 10,
        y: 15,
        rotation: 0,
        flipped: false,
      };

      const placedMotif = await motifService.placeMotif(project.id, request);

      expect(placedMotif).toBeDefined();
      expect(placedMotif.id).toBeDefined();
      expect(placedMotif.motifId).toBe('rose-flower');
      expect(placedMotif.x).toBe(10);
      expect(placedMotif.y).toBe(15);
      expect(placedMotif.rotation).toBe(0);
      expect(placedMotif.flipped).toBe(false);
      expect(placedMotif.placedAt).toBeInstanceOf(Date);
    });

    it('should prevent motif placement outside grid boundaries', async () => {
      const project = await projectService.createProject({
        name: 'Boundary Test',
        dimensions: { width: 30, height: 20 },
      });

      const request: PlaceMotifRequest = {
        motifId: 'large-bird',
        x: 25, // Too close to right edge for a 10x10 motif
        y: 15,
        rotation: 0,
        flipped: false,
      };

      await expect(
        motifService.placeMotif(project.id, request)
      ).rejects.toThrow('Motif would exceed grid boundaries');
    });

    it('should prevent overlapping motifs', async () => {
      const project = await projectService.createProject({
        name: 'Overlap Test',
        dimensions: { width: 50, height: 40 },
      });

      // Place first motif
      await motifService.placeMotif(project.id, {
        motifId: 'rose-flower',
        x: 10,
        y: 10,
        rotation: 0,
        flipped: false,
      });

      // Attempt to place overlapping motif
      const overlappingRequest: PlaceMotifRequest = {
        motifId: 'small-bird',
        x: 12, // Overlaps with rose
        y: 12,
        rotation: 0,
        flipped: false,
      };

      await expect(
        motifService.placeMotif(project.id, overlappingRequest)
      ).rejects.toThrow('Motif would overlap with existing motif');
    });

    it('should support motif rotation (90, 180, 270 degrees)', async () => {
      const project = await projectService.createProject({
        name: 'Rotation Test',
        dimensions: { width: 50, height: 40 },
      });

      const request: PlaceMotifRequest = {
        motifId: 'arrow-shape',
        x: 20,
        y: 20,
        rotation: 90,
        flipped: false,
      };

      const placedMotif = await motifService.placeMotif(project.id, request);
      expect(placedMotif.rotation).toBe(90);
    });

    it('should reject invalid rotation values', async () => {
      const project = await projectService.createProject({
        name: 'Invalid Rotation Test',
        dimensions: { width: 50, height: 40 },
      });

      const request: PlaceMotifRequest = {
        motifId: 'rose-flower',
        x: 10,
        y: 10,
        rotation: 45, // Invalid - only 0, 90, 180, 270 allowed
        flipped: false,
      };

      await expect(
        motifService.placeMotif(project.id, request)
      ).rejects.toThrow('Rotation must be 0, 90, 180, or 270 degrees');
    });
  });

  describe('removeMotif', () => {
    it('should remove a placed motif successfully', async () => {
      const project = await projectService.createProject({
        name: 'Remove Test',
        dimensions: { width: 50, height: 40 },
      });

      // Place a motif
      const placedMotif = await motifService.placeMotif(project.id, {
        motifId: 'rose-flower',
        x: 10,
        y: 10,
        rotation: 0,
        flipped: false,
      });

      // Remove the motif
      await motifService.removeMotif(project.id, placedMotif.id);

      // Verify it's removed by checking project state
      const updatedProject = await projectService.getProject(project.id);
      expect(updatedProject.motifs).toHaveLength(0);
    });

    it('should throw error for non-existent motif', async () => {
      const project = await projectService.createProject({
        name: 'Remove Error Test',
        dimensions: { width: 50, height: 40 },
      });

      await expect(
        motifService.removeMotif(project.id, 'non-existent-motif-id')
      ).rejects.toThrow('Placed motif not found');
    });

    it('should throw error for non-existent project', async () => {
      await expect(
        motifService.removeMotif('non-existent-project', 'some-motif-id')
      ).rejects.toThrow('Project not found');
    });
  });
});