import { test, expect } from '@playwright/test';

test.describe('Create Basic Tote Bag Pattern Workflow', () => {
  test('should complete entire workflow from project creation to pattern export', async ({ page }) => {
    // Step 1: Navigate to application
    await page.goto('/');

    // Verify landing page loads within 3 seconds
    await expect(page.locator('h1')).toContainText('Crochet Design Tool', { timeout: 3000 });

    // Step 2: Create new project
    await page.click('button:has-text("New Project")');

    // Enter project details
    await page.fill('input[name="projectName"]', 'My First Tote');
    await page.fill('input[name="width"]', '40');
    await page.fill('input[name="height"]', '30');

    await page.click('button:has-text("Create Project")');

    // Expected: Grid appears with 40x30 cells
    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="grid-cell"]')).toHaveCount(1200); // 40 * 30

    // Verify grid dimensions
    const gridInfo = page.locator('[data-testid="grid-info"]');
    await expect(gridInfo).toContainText('40 × 30 cm');

    // Step 3: Place motifs on grid
    // Browse motif library on left panel
    const motifLibrary = page.locator('[data-testid="motif-library"]');
    await expect(motifLibrary).toBeVisible();

    // Select "Rose" motif from flower category
    await page.click('[data-testid="category-flower"]');
    await page.click('[data-testid="motif-rose"]');

    // Drag rose to center of grid (position ~20,15)
    const roseMotif = page.locator('[data-testid="motif-rose"]');
    const gridCenter = page.locator('[data-testid="grid-cell"][data-x="20"][data-y="15"]');

    await roseMotif.dragTo(gridCenter);

    // Expected: Rose motif appears on grid at specified position
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="placed-motif"]').first()).toHaveAttribute('data-motif-id', 'rose');

    // Place second motif: "Bird" at position ~10,20
    await page.click('[data-testid="category-bird"]');
    await page.click('[data-testid="motif-bird"]');

    const birdMotif = page.locator('[data-testid="motif-bird"]');
    const birdPosition = page.locator('[data-testid="grid-cell"][data-x="10"][data-y="20"]');

    await birdMotif.dragTo(birdPosition);

    // Expected: Both motifs visible without overlap
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(2);

    // Verify no overlap warnings
    await expect(page.locator('[data-testid="overlap-warning"]')).not.toBeVisible();

    // Step 4: Generate pattern
    // Verify stitch interpretation toggle is set to "Black = Filled Stitch"
    const stitchToggle = page.locator('[data-testid="stitch-interpretation"]');
    await expect(stitchToggle).toHaveText('Black = Filled Stitch');

    // Click "Generate Pattern" button
    await page.click('button:has-text("Generate Pattern")');

    // Expected: Pattern chart appears showing filled/open squares
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="pattern-row"]')).toHaveCount(30); // 30 rows

    // Expected: Yarn calculation shows number of skeins needed
    const yarnCalculation = page.locator('[data-testid="yarn-calculation"]');
    await expect(yarnCalculation).toBeVisible();
    await expect(yarnCalculation).toContainText('skeins needed');

    // Verify calculation shows at least 1 skein
    const skeinsText = await yarnCalculation.locator('[data-testid="skeins-count"]').textContent();
    const skeinsCount = parseInt(skeinsText || '0');
    expect(skeinsCount).toBeGreaterThanOrEqual(1);

    // Step 5: Export pattern
    await page.click('button:has-text("Export")');

    // Select "PDF" format
    await page.click('[data-testid="export-format-pdf"]');

    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');

    // Expected: PDF file downloads with pattern chart and instructions
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
    expect(download.suggestedFilename()).toContain('My First Tote');

    // Verify the download completed successfully
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
  });

  test('should meet performance requirements', async ({ page }) => {
    // Test performance requirements from success criteria
    const startTime = Date.now();

    await page.goto('/');

    // Project created in <2 seconds
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="projectName"]', 'Performance Test');
    await page.fill('input[name="width"]', '40');
    await page.fill('input[name="height"]', '30');

    const projectCreateStart = Date.now();
    await page.click('button:has-text("Create Project")');
    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();
    const projectCreateTime = Date.now() - projectCreateStart;

    expect(projectCreateTime).toBeLessThan(2000); // <2 seconds

    // Grid renders smoothly for 40x30 (1200 cells)
    await expect(page.locator('[data-testid="grid-cell"]')).toHaveCount(1200);

    // Pattern generates within 5 seconds
    await page.click('[data-testid="motif-rose"]');
    const gridCell = page.locator('[data-testid="grid-cell"]').first();
    await page.locator('[data-testid="motif-rose"]').dragTo(gridCell);

    const patternGenStart = Date.now();
    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();
    const patternGenTime = Date.now() - patternGenStart;

    expect(patternGenTime).toBeLessThan(5000); // <5 seconds

    // Total workflow completes in <3 minutes
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(180000); // <3 minutes
  });

  test('should handle motif placement interactions correctly', async ({ page }) => {
    await page.goto('/');

    // Create project
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="projectName"]', 'Interaction Test');
    await page.fill('input[name="width"]', '50');
    await page.fill('input[name="height"]', '40');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();

    // Test drag and drop without overlap
    await page.click('[data-testid="motif-rose"]');
    const roseMotif = page.locator('[data-testid="motif-rose"]');
    const targetCell = page.locator('[data-testid="grid-cell"][data-x="25"][data-y="20"]');

    await roseMotif.dragTo(targetCell);

    // Verify motif was placed successfully
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(1);

    // Verify motif appears at correct position
    const placedMotif = page.locator('[data-testid="placed-motif"]').first();
    await expect(placedMotif).toHaveAttribute('data-x', '25');
    await expect(placedMotif).toHaveAttribute('data-y', '20');

    // Test selection and removal
    await placedMotif.click();
    await expect(placedMotif).toHaveClass(/selected/);

    await page.keyboard.press('Delete');
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(0);
  });

  test('should validate project creation inputs', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    // Test empty name validation
    await page.fill('input[name="width"]', '40');
    await page.fill('input[name="height"]', '30');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Project name is required');

    // Test dimension validation
    await page.fill('input[name="projectName"]', 'Test Project');
    await page.fill('input[name="width"]', '19'); // Below minimum
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Width must be between 20 and 200');

    await page.fill('input[name="width"]', '201'); // Above maximum
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Width must be between 20 and 200');
  });

  test('should support pattern export with instructions and yarn calculations', async ({ page }) => {
    await page.goto('/');

    // Create and set up project
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="projectName"]', 'Export Test');
    await page.fill('input[name="width"]', '30');
    await page.fill('input[name="height"]', '25');
    await page.click('button:has-text("Create Project")');

    // Place motif and generate pattern
    await page.click('[data-testid="motif-rose"]');
    const gridCell = page.locator('[data-testid="grid-cell"]').first();
    await page.locator('[data-testid="motif-rose"]').dragTo(gridCell);

    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    // Test PDF export with all options
    await page.click('button:has-text("Export")');
    await page.check('[data-testid="include-instructions"]');
    await page.check('[data-testid="include-yarn-calculation"]');
    await page.click('[data-testid="export-format-pdf"]');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/Export Test.*\.pdf$/);

    // Test PNG export
    await page.click('button:has-text("Export")');
    await page.click('[data-testid="export-format-png"]');

    const pngDownloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');

    const pngDownload = await pngDownloadPromise;
    expect(pngDownload.suggestedFilename()).toMatch(/Export Test.*\.png$/);
  });
});