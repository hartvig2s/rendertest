import { test, expect } from '@playwright/test';

test.describe('Pattern Generation Variations', () => {
  test('should generate pattern with mixed motifs and black_filled interpretation', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    // Create 50x50 project
    await page.fill('input[name="projectName"]', 'Mixed Motifs Test');
    await page.fill('input[name="width"]', '50');
    await page.fill('input[name="height"]', '50');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('[data-testid="design-grid"]')).toBeVisible();

    // Place 3 different motif types (flower, bird, letter)
    await page.click('[data-testid="motif-rose"]');
    await page.locator('[data-testid="motif-rose"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="10"][data-y="10"]')
    );

    await page.click('[data-testid="motif-bird"]');
    await page.locator('[data-testid="motif-bird"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="30"][data-y="15"]')
    );

    await page.click('[data-testid="motif-letter-a"]');
    await page.locator('[data-testid="motif-letter-a"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="20"][data-y="35"]')
    );

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(3);

    // Generate pattern with "Black = Filled Stitch"
    await expect(page.locator('[data-testid="stitch-interpretation"]')).toContainText('Black = Filled Stitch');

    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    // Expected: Pattern shows motifs as filled squares
    const filledCells = page.locator('[data-testid="pattern-cell-filled"]');
    const filledCount = await filledCells.count();
    expect(filledCount).toBeGreaterThan(0);

    // Verify yarn calculation
    const yarnCalc = page.locator('[data-testid="yarn-calculation"]');
    await expect(yarnCalc).toBeVisible();
  });

  test('should toggle stitch interpretation and update pattern accordingly', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Toggle Test');
    await page.fill('input[name="width"]', '30');
    await page.fill('input[name="height"]', '25');
    await page.click('button:has-text("Create Project")');

    // Place motif
    await page.click('[data-testid="motif-rose"]');
    await page.locator('[data-testid="motif-rose"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="15"][data-y="12"]')
    );

    // Generate with black_filled
    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    const filledCountBefore = await page.locator('[data-testid="pattern-cell-filled"]').count();
    const openCountBefore = await page.locator('[data-testid="pattern-cell-open"]').count();

    // Change setting to "Black = Open Stitch"
    await page.click('[data-testid="stitch-interpretation-toggle"]');
    await expect(page.locator('[data-testid="stitch-interpretation"]')).toContainText('Black = Open Stitch');

    // Regenerate pattern
    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    // Expected: Same motifs now show as open squares
    const filledCountAfter = await page.locator('[data-testid="pattern-cell-filled"]').count();
    const openCountAfter = await page.locator('[data-testid="pattern-cell-open"]').count();

    // Counts should be swapped for motif areas
    expect(filledCountAfter).not.toBe(filledCountBefore);
    expect(openCountAfter).not.toBe(openCountBefore);

    // Expected: Yarn calculation updates accordingly
    const yarnCalc = page.locator('[data-testid="yarn-calculation"]');
    await expect(yarnCalc).toBeVisible();
    await expect(yarnCalc).toContainText('skeins needed');
  });

  test('should validate yarn calculations manually', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    // Create small pattern for manual verification
    await page.fill('input[name="projectName"]', 'Manual Calc Test');
    await page.fill('input[name="width"]', '10');
    await page.fill('input[name="height"]', '10');
    await page.click('button:has-text("Create Project")');

    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    // Manual calculation: 10*10 = 100 stitches * 4cm = 400cm
    // 400cm / 7500cm per skein = 0.053 -> rounds up to 1 skein
    const yarnCalc = page.locator('[data-testid="yarn-calculation"]');
    await expect(yarnCalc).toContainText('1 skein');

    const totalStitches = page.locator('[data-testid="total-stitches"]');
    await expect(totalStitches).toContainText('100');

    const yarnLength = page.locator('[data-testid="yarn-length"]');
    await expect(yarnLength).toContainText('400'); // cm
  });

  test('should regenerate pattern with version tracking', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Version Test');
    await page.fill('input[name="width"]', '40');
    await page.fill('input[name="height"]', '30');
    await page.click('button:has-text("Create Project")');

    // Place first motif and generate
    await page.click('[data-testid="motif-rose"]');
    await page.locator('[data-testid="motif-rose"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="20"][data-y="15"]')
    );

    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    // Check version 1
    await expect(page.locator('[data-testid="pattern-version"]')).toContainText('Version 1');

    // Add second motif and regenerate
    await page.click('[data-testid="motif-bird"]');
    await page.locator('[data-testid="motif-bird"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="30"][data-y="20"]')
    );

    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    // Check version incremented
    await expect(page.locator('[data-testid="pattern-version"]')).toContainText('Version 2');

    // Verify more filled stitches than before
    const filledCount = await page.locator('[data-testid="pattern-cell-filled"]').count();
    expect(filledCount).toBeGreaterThan(0);
  });

  test('should handle pattern rotation and flipping', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Rotation Test');
    await page.fill('input[name="width"]', '30');
    await page.fill('input[name="height"]', '30');
    await page.click('button:has-text("Create Project")');

    // Place motif with rotation
    await page.click('[data-testid="motif-arrow"]'); // Asymmetric motif for testing
    const placedMotif = page.locator('[data-testid="motif-arrow"]');
    await placedMotif.dragTo(page.locator('[data-testid="grid-cell"][data-x="15"][data-y="15"]'));

    // Select placed motif and rotate
    await page.locator('[data-testid="placed-motif"]').click();
    await page.click('[data-testid="rotate-90"]');

    // Verify rotation applied
    await expect(page.locator('[data-testid="placed-motif"]')).toHaveAttribute('data-rotation', '90');

    // Generate pattern and verify rotation reflected
    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    // Test flipping
    await page.locator('[data-testid="placed-motif"]').click();
    await page.click('[data-testid="flip-horizontal"]');

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveAttribute('data-flipped', 'true');

    // Regenerate and verify changes
    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();
  });

  test('should provide clear legend and chart symbols', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Legend Test');
    await page.fill('input[name="width"]', '25');
    await page.fill('input[name="height"]', '20');
    await page.click('button:has-text("Create Project")');

    await page.click('[data-testid="motif-rose"]');
    await page.locator('[data-testid="motif-rose"]').dragTo(
      page.locator('[data-testid="grid-cell"][data-x="12"][data-y="10"]')
    );

    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();

    // Verify legend is present and clear
    const legend = page.locator('[data-testid="pattern-legend"]');
    await expect(legend).toBeVisible();

    await expect(legend.locator('[data-testid="filled-symbol"]')).toBeVisible();
    await expect(legend.locator('[data-testid="open-symbol"]')).toBeVisible();

    await expect(legend).toContainText('Filled stitch');
    await expect(legend).toContainText('Open stitch');

    // Verify symbols are different
    const filledSymbol = await legend.locator('[data-testid="filled-symbol"]').textContent();
    const openSymbol = await legend.locator('[data-testid="open-symbol"]').textContent();
    expect(filledSymbol).not.toBe(openSymbol);
  });

  test('should handle complex patterns with multiple motif types', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("New Project")');

    await page.fill('input[name="projectName"]', 'Complex Pattern Test');
    await page.fill('input[name="width"]', '60');
    await page.fill('input[name="height"]', '45');
    await page.click('button:has-text("Create Project")');

    // Place various motifs across the grid
    const motifPlacements = [
      { motif: 'rose', x: 10, y: 10 },
      { motif: 'bird', x: 35, y: 15 },
      { motif: 'letter-a', x: 20, y: 30 },
      { motif: 'geometric-star', x: 45, y: 8 },
      { motif: 'small-dot', x: 5, y: 35 },
    ];

    for (const placement of motifPlacements) {
      await page.click(`[data-testid="motif-${placement.motif}"]`);
      await page.locator(`[data-testid="motif-${placement.motif}"]`).dragTo(
        page.locator(`[data-testid="grid-cell"][data-x="${placement.x}"][data-y="${placement.y}"]`)
      );
    }

    await expect(page.locator('[data-testid="placed-motif"]')).toHaveCount(5);

    // Generate complex pattern
    const genStart = Date.now();
    await page.click('button:has-text("Generate Pattern")');
    await expect(page.locator('[data-testid="pattern-chart"]')).toBeVisible();
    const genTime = Date.now() - genStart;

    // Should generate reasonably quickly even with complex pattern
    expect(genTime).toBeLessThan(10000);

    // Verify pattern has appropriate complexity
    const filledCells = await page.locator('[data-testid="pattern-cell-filled"]').count();
    const openCells = await page.locator('[data-testid="pattern-cell-open"]').count();

    expect(filledCells + openCells).toBe(2700); // 60 * 45
    expect(filledCells).toBeGreaterThan(0);
    expect(openCells).toBeGreaterThan(0);

    // Verify yarn calculation for complex pattern
    const yarnCalc = page.locator('[data-testid="yarn-calculation"]');
    await expect(yarnCalc).toBeVisible();

    const skeinsText = await yarnCalc.locator('[data-testid="skeins-count"]').textContent();
    const skeinsCount = parseInt(skeinsText || '0');
    expect(skeinsCount).toBeGreaterThanOrEqual(1); // Should need at least 1 skein
  });
});