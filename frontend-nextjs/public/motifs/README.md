# Motif Library

This folder contains the permanent motif library that will be available to all users.

## How to Add Motifs

1. **Add your motif images to this folder** (`public/motifs/`)
   - Supported formats: PNG, JPG, JPEG, GIF, SVG
   - Images should have the motif filled in (dark areas will become filled stitches)
   - Best results with high-contrast images (dark motif on light background)

2. **Update the motif list in the code**
   - Open: `src/components/DesignWorkspace.tsx`
   - Find the `loadLibraryMotifs` function (around line 234)
   - Add your filenames to the `motifFiles` array:

   ```typescript
   const motifFiles = [
     'flower1.png',
     'bird1.png',
     'heart.png',
     // Add your files here
   ];
   ```

3. **Restart the dev server** if running

## Example

If you have a file named `rose.png` in this folder:

1. Place `rose.png` in `/public/motifs/rose.png`
2. Add `'rose.png'` to the motifFiles array
3. The motif will appear in the library as "rose" (filename without extension)

## Tips

- Use clear, simple designs for best results
- Dark pixels (< 50% brightness) = filled stitches
- Light pixels (> 50% brightness) = open stitches
- Transparent pixels are ignored
- The image will be converted to fit the grid automatically
