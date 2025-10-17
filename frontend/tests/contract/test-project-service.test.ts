import { describe, it, expect, vi } from 'vitest';
import { ProjectService } from '@/services/project-service';
import { CreateProjectRequest, Project } from '@/types/project';

describe('ProjectService Contract Tests', () => {
  const projectService = new ProjectService();

  describe('createProject', () => {
    it('should create a new project with valid dimensions', async () => {
      const request: CreateProjectRequest = {
        name: 'Test Tote Bag',
        dimensions: {
          width: 40,
          height: 30,
        },
      };

      const result = await projectService.createProject(request);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Tote Bag');
      expect(result.dimensions.width).toBe(40);
      expect(result.dimensions.height).toBe(30);
      expect(result.grid.width).toBe(40);
      expect(result.grid.height).toBe(30);
      expect(result.motifs).toEqual([]);
      expect(result.pattern).toBeNull();
      expect(result.yarnCalculation).toBeNull();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should reject dimensions below minimum (20cm)', async () => {
      const request: CreateProjectRequest = {
        name: 'Invalid Small',
        dimensions: {
          width: 19,
          height: 30,
        },
      };

      await expect(projectService.createProject(request)).rejects.toThrow(
        'Width must be between 20 and 200 cm'
      );
    });

    it('should reject dimensions above maximum (200cm)', async () => {
      const request: CreateProjectRequest = {
        name: 'Invalid Large',
        dimensions: {
          width: 40,
          height: 201,
        },
      };

      await expect(projectService.createProject(request)).rejects.toThrow(
        'Height must be between 20 and 200 cm'
      );
    });

    it('should reject empty project name', async () => {
      const request: CreateProjectRequest = {
        name: '',
        dimensions: {
          width: 40,
          height: 30,
        },
      };

      await expect(projectService.createProject(request)).rejects.toThrow(
        'Project name is required'
      );
    });
  });

  describe('getProject', () => {
    it('should retrieve an existing project by ID', async () => {
      // First create a project
      const createRequest: CreateProjectRequest = {
        name: 'Test Project',
        dimensions: { width: 50, height: 40 },
      };
      const createdProject = await projectService.createProject(createRequest);

      // Then retrieve it
      const retrievedProject = await projectService.getProject(createdProject.id);

      expect(retrievedProject).toBeDefined();
      expect(retrievedProject.id).toBe(createdProject.id);
      expect(retrievedProject.name).toBe('Test Project');
      expect(retrievedProject.dimensions.width).toBe(50);
      expect(retrievedProject.dimensions.height).toBe(40);
    });

    it('should throw error for non-existent project ID', async () => {
      const nonExistentId = 'non-existent-uuid';

      await expect(projectService.getProject(nonExistentId)).rejects.toThrow(
        'Project not found'
      );
    });

    it('should throw error for invalid UUID format', async () => {
      const invalidId = 'invalid-uuid-format';

      await expect(projectService.getProject(invalidId)).rejects.toThrow(
        'Invalid project ID format'
      );
    });
  });

  describe('updateProject', () => {
    it('should update project name and settings', async () => {
      // Create a project first
      const createRequest: CreateProjectRequest = {
        name: 'Original Name',
        dimensions: { width: 40, height: 30 },
      };
      const project = await projectService.createProject(createRequest);

      // Update the project
      const updateRequest = {
        name: 'Updated Name',
        settings: {
          stitchInterpretation: 'black_open' as const,
          showGrid: false,
          snapToGrid: true,
          autoSave: false,
          exportFormat: 'png' as const,
        },
      };

      const updatedProject = await projectService.updateProject(
        project.id,
        updateRequest
      );

      expect(updatedProject.name).toBe('Updated Name');
      expect(updatedProject.settings.stitchInterpretation).toBe('black_open');
      expect(updatedProject.settings.showGrid).toBe(false);
      expect(updatedProject.updatedAt.getTime()).toBeGreaterThan(
        project.updatedAt.getTime()
      );
    });

    it('should throw error for non-existent project', async () => {
      const updateRequest = { name: 'New Name' };

      await expect(
        projectService.updateProject('non-existent-id', updateRequest)
      ).rejects.toThrow('Project not found');
    });
  });
});