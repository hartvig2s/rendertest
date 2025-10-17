import { test, expect } from '@playwright/test';

test.describe('Data Persistence Scenarios', () => {
  test('should auto-save project data and restore after browser refresh', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    // Create project with specific data
    await page.fill('input[name="projectName"]', 'Auto-Save Test Project');
    await page.fill('input[name="width"]', '35');
    await page.fill('input[name="height"]', '28');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();

    // Place multiple motifs to create substantial data
    await page.click('[data-testid="motif-rose"]');
    await page.locator('[data-testid="motif-rose"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="10"][data-y="10"]')
    );

    await page.click('[data-testid="motif-bird"]');
    await page.locator('[data-testid="motif-bird"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="25"][data-y="15"]')
    );

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(2);

    // Wait for auto-save (30 seconds according to spec)
    await page.waitForTimeout(2000); // Reduced for testing

    // Verify auto-save indicator if present
    const autoSaveIndicator = page.locator('[data-testid="auto-save-indicator"]');
    if (await autoSaveIndicator.isVisible()) {
      await expect(autoSaveIndicator).toContainText(/saved|auto.?saved/i);
    }

    // Refresh browser page
    await page.reload();

    // Verify project loads with all motifs intact
    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-title"]')).toContainText('Auto-Save Test Project');
    await expect(page.locator('[data-testid="grid-info"]')).toContainText('35 × 28 cm');
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(2);

    // Verify motif positions are correct
    const roseMotif = page.locator('[data-testid="placed-motif"][data-motif-id="rose"]');
    await expect(roseMotif).toHaveAttribute('data-x', '10');
    await expect(roseMotif).toHaveAttribute('data-y', '10');

    const birdMotif = page.locator('[data-testid="placed-motif"][data-motif-id="bird"]');
    await expect(birdMotif).toHaveAttribute('data-x', '25');
    await expect(birdMotif).toHaveAttribute('data-y', '15');
  });

  test('should export and import project as JSON with complete fidelity', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    // Create detailed project
    await page.fill('input[name="projectName"]', 'JSON Export Test');
    await page.fill('input[name="width"]', '40');
    await page.fill('input[name="height"]', '32');
    await page.click('button:has-text("Create Project")');

    // Place motifs with different properties
    await page.click('[data-testid="motif-letter-a"]');
    await page.locator('[data-testid="motif-letter-a"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="15"][data-y="16"]')
    );

    // Rotate and flip motif
    await page.locator('[data-testid="placed-motif"]').click();
    await page.click('[data-testid="rotate-90"]');
    await page.click('[data-testid="flip-horizontal"]');

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveAttribute('data-rotation', '90');
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveAttribute('data-flipped', 'true');

    // Generate pattern
    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    // Change settings
    await page.click('[data-testid="stitch-interpretation-toggle"]');
    await page.uncheck('[data-testid="show-grid"]');
    await page.check('[data-testid="snap-to-grid"]');

    // Export as JSON
    await page.click('button:has-text("Export")');
    await page.click('[data-testid="export-format-json"]');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/JSON Export Test.*\.json$/);

    // Save the downloaded file content
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    // Clear browser storage to simulate fresh state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.reload();

    // Import the JSON file
    await expect(page.locator('button:has-text("New Project")')).toBeVisible(); // Back to fresh state

    await page.click('button:has-text("Import Project")');

    // Set up file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(downloadPath!);

    // Verify project restores exactly as exported
    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-title"]')).toContainText('JSON Export Test');
    await expect(page.locator('[data-testid="grid-info"]')).toContainText('40 × 32 cm');

    // Verify motif with all properties
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);

    const restoredMotif = page.locator('[data-testid="placed-motif"]');
    await expect(restoredMotif).toHaveAttribute('data-motif-id', 'letter-a');
    await expect(restoredMotif).toHaveAttribute('data-x', '15');
    await expect(restoredMotif).toHaveAttribute('data-y', '16');
    await expect(restoredMotif).toHaveAttribute('data-rotation', '90');
    await expect(restoredMotif).toHaveAttribute('data-flipped', 'true');

    // Verify pattern was restored
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    // Verify settings were restored
    await expect(page.locator('[data-testid="stitch-interpretation"]')).toContainText('Black = Open Stitch');
    await expect(page.locator('[data-testid="show-grid"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="snap-to-grid"]')).toBeChecked();
  });

  test('should maintain independent state across multiple projects', async ({ page }) => {
    // Create first project
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Project Alpha');
    await page.fill('input[name="width"]', '30');
    await page.fill('input[name="height"]', '25');
    await page.click('button:has-text("Create Project")');

    await page.click('[data-testid="motif-rose"]');
    await page.locator('[data-testid="motif-rose"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="10"][data-y="10"]')
    );

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);

    // Save/create second project
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Project Beta');
    await page.fill('input[name="width"]', '40');
    await page.fill('input[name="height"]', '20');
    await page.click('button:has-text("Create Project")');

    await page.click('[data-testid="motif-bird"]');
    await page.locator('[data-testid="motif-bird"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="20"][data-y="8"]')
    );

    await page.click('[data-testid="motif-letter-b"]');
    await page.locator('[data-testid="motif-letter-b"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="30"][data-y="12"]')
    );

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(2);

    // Switch between projects and verify independence
    await page.click('[data-testid="project-list"]');
    await page.click('[data-testid="project-alpha"]');

    // Verify Project Alpha state
    await expect(page.locator('[data-testid="project-title"]')).toContainText('Project Alpha');
    await expect(page.locator('[data-testid="grid-info"]')).toContainText('30 × 25 cm');
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveAttribute('data-motif-id', 'rose');

    // Switch to Project Beta
    await page.click('[data-testid="project-list"]');
    await page.click('[data-testid="project-beta"]');

    // Verify Project Beta state
    await expect(page.locator('[data-testid="project-title"]')).toContainText('Project Beta');
    await expect(page.locator('[data-testid="grid-info"]')).toContainText('40 × 20 cm');
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(2);

    const motifs = page.locator('[data-testid="placed-motif"]');
    await expect(motifs.nth(0)).toHaveAttribute('data-motif-id', 'bird');
    await expect(motifs.nth(1)).toHaveAttribute('data-motif-id', 'letter-b');
  });

  test('should handle browser storage limits gracefully', async ({ page }) => {
    await page.goto('/');

    // Create multiple projects to test storage limits
    const projectCount = 5;

    for (let i = 1; i <= projectCount; i++) {
      await page.click('button:has-text("New Project")');

      await page.fill('input[name="projectName"]', `Storage Test ${i}`);
      await page.fill('input[name="width"]', '50');
      await page.fill('input[name="height"]', '40');
      await page.click('button:has-text("Create Project")');

      // Add data to each project
      await page.click('[data-testid="motif-rose"]');
      await page.locator('[data-testid="motif-rose"]').dragTo(
        page.locator('[data-testid="grid-cell"][data-x="25"][data-y="20"]')
      );

      await page.click('button:has-text("Generate Pattern")');
      await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

      await page.waitForTimeout(500); // Allow auto-save
    }

    // Verify all projects were stored
    await page.click('[data-testid="project-list"]');

    for (let i = 1; i <= projectCount; i++) {
      await expect(page.locator(`[data-testid="project-storage-test-${i}"]`)).toBeVisible();
    }

    // Test accessing each project
    for (let i = 1; i <= projectCount; i++) {
      await page.click(`[data-testid="project-storage-test-${i}"]`);

      await expect(page.locator('[data-testid="project-title"]')).toContainText(`Storage Test ${i}`);
      await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

      if (i < projectCount) {
        await page.click('[data-testid="project-list"]');
      }
    }
  });

  test('should handle corrupted storage data gracefully', async ({ page }) => {
    await page.goto('/');

    // Create a normal project first
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="projectName"]', 'Normal Project');
    await page.fill('input[name="width"]', '30');
    await page.fill('input[name="height"]', '25');
    await page.click('button:has-text("Create Project")');

    await page.click('[data-testid="motif-rose"]');
    await page.locator('[data-testid="motif-rose"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="15"][data-y="12"]')
    );

    await page.waitForTimeout(1000); // Allow auto-save

    // Corrupt localStorage data
    await page.evaluate(() => {
      localStorage.setItem('crochet-projects', '{"invalid": json}');
    });

    // Refresh and verify graceful handling
    await page.reload();

    // Should not crash, either show error message or start fresh
    const hasErrorMessage = await page.locator('[data-testid="storage-error"]').isVisible({ timeout: 3000 });
    const hasNewProjectButton = await page.locator('button:has-text("New Project")').isVisible({ timeout: 3000 });

    expect(hasErrorMessage || hasNewProjectButton).toBe(true);

    if (hasErrorMessage) {
      await expect(page.locator('[data-testid="storage-error"]')).toContainText(/storage.*corrupt|data.*recover/i);

      // Should provide option to start fresh
      await page.click('button:has-text("Start Fresh")');
    }

    // Should be able to create new projects after corruption
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="projectName"]', 'Recovery Test');
    await page.fill('input[name="width"]', '25');
    await page.fill('input[name="height"]', '20');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-title"]')).toContainText('Recovery Test');
  });

  test('should support project versioning and history', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Version History Test');
    await page.fill('input[name="width"]', '35');
    await page.fill('input[name="height"]', '30');
    await page.click('button:has-text("Create Project")');

    // Initial state - no motifs
    await page.waitForTimeout(500);

    // Add first motif (version 1)
    await page.click('[data-testid="motif-rose"]');
    await page.locator('[data-testid="motif-rose"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="10"][data-y="10"]')
    );

    await page.waitForTimeout(500); // Allow history save

    // Add second motif (version 2)
    await page.click('[data-testid="motif-bird"]');
    await page.locator('[data-testid="motif-bird"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="25"][data-y="20"]')
    );

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(2);
    await page.waitForTimeout(500);

    // Test undo functionality if available
    const undoButton = page.locator('[data-testid="undo"]');

    if (await undoButton.isVisible()) {
      await undoButton.click();

      // Should revert to previous state
      await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="placed-motif"]')).toHaveAttribute('data-motif-id', 'rose');

      // Test redo
      const redoButton = page.locator('[data-testid="redo"]');
      if (await redoButton.isVisible()) {
        await redoButton.click();
        await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(2);
      }
    }

    // Test project history if available
    const historyButton = page.locator('[data-testid="project-history"]');

    if (await historyButton.isVisible()) {
      await historyButton.click();

      await expect(page.locator('[data-testid="history-panel"]')).toBeVisible();

      // Should show multiple versions
      const historyItems = page.locator('[data-testid="history-item"]');
      const itemCount = await historyItems.count();
      expect(itemCount).toBeGreaterThanOrEqual(2);

      // Test reverting to older version
      await historyItems.first().click();
      await page.click('button:has-text("Restore")');

      // Should confirm restoration
      await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);
    }
  });
});