import { test, expect } from '@playwright/test';

test.describe('Boundary Validation Edge Cases', () => {
  test('should handle minimum dimensions (20x20)', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    // Test minimum dimensions
    await page.fill('input[name="projectName"]', 'Minimum Size Test');
    await page.fill('input[name="width"]', '20');
    await page.fill('input[name="height"]', '20');
    await page.click('button:has-text("Create Project")');

    // Expected: Grid creates successfully with 400 cells
    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="grid-cell"]')).toHaveCount(400); // 20 * 20

    // Verify grid info displays correct dimensions
    await expect(page.locator('[data-testid="grid-info"]')).toContainText('20 × 20 cm');

    // Test that motifs can still be placed
    await page.click('[data-testid="motif-small-dot"]'); // Assuming a small 1x1 motif exists
    const gridCell = page.locator('[data-testid="grid-cell"]').first();
    await page.locator('[data-testid="motif-small-dot"]').dragTo(gridCell);

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);

    // Pattern generation should work
    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    // Yarn calculation should show minimal requirements
    const yarnCalc = page.locator('[data-testid="yarn-calculation"]');
    await expect(yarnCalc).toContainText('1 skein'); // 400 stitches * 4cm = 1600cm < 7500cm
  });

  test('should handle maximum dimensions (200x200) with performance warnings', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    // Test maximum dimensions
    await page.fill('input[name="projectName"]', 'Maximum Size Test');
    await page.fill('input[name="width"]', '200');
    await page.fill('input[name="height"]', '200');

    const createStart = Date.now();
    await page.click('button:has-text("Create Project")');

    // Expected: Grid creates but may show performance warning
    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible({ timeout: 15000 });

    const createTime = Date.now() - createStart;

    // Expected: Grid creates with performance warning but renders smoothly
    if (createTime > 10000) {
      await expect(page.locator('[data-testid="performance-warning"]')).toBeVisible();
    }

    // Expected: Scrollbars appear for navigation
    const gridContainer = page.locator('[data-testid="grid-container"]');
    await expect(gridContainer).toHaveCSS('overflow', 'auto');

    // Test navigation with large grid
    await gridContainer.evaluate((el) => {
      el.scrollTo(5000, 5000); // Scroll to middle
    });

    // Verify grid cells are still interactive after scrolling
    const centerCell = page.locator('[data-testid="grid-cell"][data-x="100"][data-y="100"]');
    await expect(centerCell).toBeVisible();

    // Test motif placement on large grid
    await page.click('[data-testid="motif-small-dot"]');
    await page.locator('[data-testid="motif-small-dot"]').dragTo(centerCell);

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);

    // Yarn calculation should show many skeins needed
    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible({ timeout: 15000 });

    const yarnCalc = page.locator('[data-testid="yarn-calculation"]');
    await expect(yarnCalc).toBeVisible();

    // 200*200*4cm = 160000cm = ~22 skeins
    const skeinsText = await yarnCalc.locator('[data-testid="skeins-count"]').textContent();
    const skeinsCount = parseInt(skeinsText || '0');
    expect(skeinsCount).toBeGreaterThanOrEqual(20);
  });

  test('should prevent motif placement outside grid boundaries', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Boundary Test');
    await page.fill('input[name="width"]', '30');
    await page.fill('input[name="height"]', '20');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();

    // Select large motif (assuming 10x10 cells)
    await page.click('[data-testid="motif-large-flower"]'); // Assuming this exists

    // Attempt to place at position that would exceed boundaries (25, 15) on 30x20 grid
    const edgeCell = page.locator('[data-testid="grid-cell"][data-x="25"][data-y="15"]');

    // Try to drag motif to edge position
    await page.locator('[data-testid="motif-large-flower"]').dragTo(edgeCell);

    // Expected: System prevents placement (would exceed boundaries)
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(0);

    // Expected: Clear error message displayed
    await expect(page.locator('[data-testid="boundary-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="boundary-error"]')).toContainText('Motif would exceed grid boundaries');

    // Verify error disappears after a valid placement
    const validCell = page.locator('[data-testid="grid-cell"][data-x="5"][data-y="5"]');
    await page.locator('[data-testid="motif-large-flower"]').dragTo(validCell);

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="boundary-error"]')).not.toBeVisible();
  });

  test('should handle overlapping motifs appropriately', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Overlap Test');
    await page.fill('input[name="width"]', '50');
    await page.fill('input[name="height"]', '40');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();

    // Place first motif
    await page.click('[data-testid="motif-rose"]');
    const firstPosition = page.locator('[data-testid="grid-cell"][data-x="10"][data-y="10"]');
    await page.locator('[data-testid="motif-rose"]').dragTo(firstPosition);

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);

    // Attempt to place overlapping motif
    await page.click('[data-testid="motif-bird"]');
    const overlappingPosition = page.locator('[data-testid="grid-cell"][data-x="12"][data-y="12"]'); // Overlaps with rose

    await page.locator('[data-testid="motif-bird"]').dragTo(overlappingPosition);

    // Expected: System prevents overlap or provides clear warning
    const overlapDialog = page.locator('[data-testid="overlap-dialog"]');

    if (await overlapDialog.isVisible()) {
      // Expected: User can choose to replace or cancel
      await expect(overlapDialog).toContainText('Motif would overlap');
      await expect(overlapDialog.locator('button:has-text("Replace")')).toBeVisible();
      await expect(overlapDialog.locator('button:has-text("Cancel")')).toBeVisible();

      // Test cancel option
      await overlapDialog.locator('button:has-text("Cancel")').click();
      await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1); // Still only first motif

      // Test replace option
      await page.locator('[data-testid="motif-bird"]').dragTo(overlappingPosition);
      await overlapDialog.locator('button:has-text("Replace")').click();
      await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1); // Bird replaces rose

      const remainingMotif = page.locator('[data-testid="placed-motif"]').first();
      await expect(remainingMotif).toHaveAttribute('data-motif-id', 'bird');
    } else {
      // Alternative: System completely prevents overlap
      await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="overlap-error"]')).toBeVisible();
    }
  });

  test('should validate dimension input ranges', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Validation Test');

    // Test below minimum (19cm)
    await page.fill('input[name="width"]', '19');
    await page.fill('input[name="height"]', '30');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="validation-error"]')).toContainText('Width must be between 20 and 200');

    // Test above maximum (201cm)
    await page.fill('input[name="width"]', '201');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="validation-error"]')).toContainText('Width must be between 20 and 200');

    // Test height validation
    await page.fill('input[name="width"]', '50');
    await page.fill('input[name="height"]', '19');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="validation-error"]')).toContainText('Height must be between 20 and 200');

    await page.fill('input[name="height"]', '201');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="validation-error"]')).toContainText('Height must be between 20 and 200');

    // Test non-numeric input
    await page.fill('input[name="width"]', 'abc');
    await page.fill('input[name="height"]', '30');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="validation-error"]')).toContainText('Width must be a number');

    // Test decimal values (should be rounded or rejected)
    await page.fill('input[name="width"]', '30.5');
    await page.fill('input[name="height"]', '25.7');
    await page.click('button:has-text("Create Project")');

    // Should either round to integers or show validation error
    const hasGrid = await page.locator('[data-testid="design-grid"]').isVisible();
    if (hasGrid) {
      // Values were rounded - verify grid size
      const gridInfo = page.locator('[data-testid="grid-info"]');
      await expect(gridInfo).toContainText(/3[01] × 2[56] cm/); // Rounded values
    } else {
      // Decimal values rejected
      await expect(page.locator('[data-testid="validation-error"]')).toContainText(/must be.*integer/);
    }
  });

  test('should handle empty and invalid project names', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    // Test empty name
    await page.fill('input[name="width"]', '40');
    await page.fill('input[name="height"]', '30');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="validation-error"]')).toContainText('Project name is required');

    // Test very long name
    const longName = 'A'.repeat(101); // Assuming 100 char limit
    await page.fill('input[name="projectName"]', longName);
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="validation-error"]')).toContainText('Project name must be 100 characters or less');

    // Test special characters (should be allowed)
    await page.fill('input[name="projectName"]', 'Test-Project_123 (v2)');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-title"]')).toContainText('Test-Project_123 (v2)');
  });

  test('should handle grid performance with many motifs', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Performance Stress Test');
    await page.fill('input[name="width"]', '100');
    await page.fill('input[name="height"]', '80');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();

    // Place multiple small motifs to test performance
    const startTime = Date.now();

    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="motif-small-dot"]');
      const targetCell = page.locator(`[data-testid="grid-cell"][data-x="${i * 10}"][data-y="${i * 8}"]`);
      await page.locator('[data-testid="motif-small-dot"]').dragTo(targetCell);
    }

    const placementTime = Date.now() - startTime;

    // Should handle 10 motifs reasonably quickly
    expect(placementTime).toBeLessThan(10000); // <10 seconds for 10 motifs

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(10);

    // Pattern generation should still work with many motifs
    const genStart = Date.now();
    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();
    const genTime = Date.now() - genStart;

    expect(genTime).toBeLessThan(15000); // <15 seconds for complex pattern
  });

  test('should handle browser refresh and data persistence', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Persistence Test');
    await page.fill('input[name="width"]', '40');
    await page.fill('input[name="height"]', '30');
    await page.click('button:has-text("Create Project")');

    // Place a motif
    await page.click('[data-testid="motif-rose"]');
    const gridCell = page.locator('[data-testid="grid-cell"][data-x="20"][data-y="15"]');
    await page.locator('[data-testid="motif-rose"]').dragTo(gridCell);

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);

    // Wait for auto-save (if implemented)
    await page.waitForTimeout(2000);

    // Refresh the page
    await page.reload();

    // Check if project data persisted
    const hasProject = await page.locator('[data-testid="design-grid"]').isVisible({ timeout: 5000 });

    if (hasProject) {
      // Data persisted
      await expect(page.locator('[data-testid="project-title"]')).toContainText('Persistence Test');
      await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);
    } else {
      // No persistence - should show project list or welcome screen
      await expect(page.locator('button:has-text("New Project")')).toBeVisible();
    }
  });
});