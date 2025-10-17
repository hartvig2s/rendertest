# Migration Plan: Vite React → Next.js for Render Deployment

**Date**: 2025-10-17
**Current Stack**: React 18 + Vite + TypeScript
**Target Stack**: Next.js 14 + TypeScript (Static Export → Web Service)

---

## Executive Summary

Two-phase migration to deploy Norwegian crochet pattern designer on Render:
- **Phase 1**: Static site deployment (1-2 days) - Get test users immediately
- **Phase 2**: Full web service (when needed) - Add backend features based on feedback

---

## Phase 1: Next.js Static Export for Render

### Goals
✅ Deploy working app to Render within 1-2 days
✅ All current features work client-side
✅ Zero backend infrastructure
✅ Easy path to Phase 2

### Current State Analysis

**Dependencies to preserve:**
- `@react-pdf/renderer`: PDF generation (client-side, works in Next.js)
- `konva` + `react-konva`: Canvas rendering (client-side compatible)
- `@dnd-kit/*`: Drag and drop (React hooks, Next.js compatible)
- `html2canvas`: Screenshot generation (browser API, works in Next.js)
- `zustand`: State management (client-side, Next.js compatible)

**Potential issues:**
- ❌ `ngrok`: Dev tool only, remove from production dependencies
- ⚠️ Canvas API: Ensure `'use client'` directive on components
- ⚠️ Browser APIs: Window/document access needs client-side guards

**File structure:**
```
frontend/src/
├── App.tsx                          # Main router
├── main.tsx                         # Vite entry point
├── components/
│   ├── DesignWorkspace.tsx         # Main workspace (uses Canvas API)
│   ├── PatternPDF.tsx              # PDF generation
│   └── ProjectCreation.tsx         # Project setup
├── types/                          # TypeScript definitions
└── StreamlitComponent.tsx          # Legacy? (can remove)
```

---

## Migration Steps - Phase 1

### Step 1: Project Setup (30 min)
1. Create new Next.js project in parallel
2. Copy over source files
3. Install dependencies
4. Configure TypeScript

**Commands:**
```bash
cd /Users/wilhelm.hartvig/newtest/tirsdag
npx create-next-app@latest frontend-nextjs --typescript --tailwind --app --no-src-dir
cd frontend-nextjs
npm install @react-pdf/renderer konva react-konva @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities html2canvas zustand uuid
npm install -D @types/uuid
```

### Step 2: File Structure Migration (1 hour)

**Next.js App Router structure:**
```
frontend-nextjs/
├── app/
│   ├── layout.tsx                  # Root layout (replaces index.html)
│   ├── page.tsx                    # Home page (App.tsx content)
│   └── globals.css                 # Global styles
├── components/
│   ├── DesignWorkspace.tsx         # Add 'use client'
│   ├── PatternPDF.tsx              # Add 'use client'
│   └── ProjectCreation.tsx         # Add 'use client'
├── types/                          # Copy as-is
├── public/
│   └── motifs/                     # Copy all motif images
├── next.config.js                  # Configure static export
└── package.json
```

**Key changes:**
- Add `'use client'` to all components using hooks/browser APIs
- Replace `main.tsx` with `app/layout.tsx` + `app/page.tsx`
- Move CSS to `app/globals.css`
- Update imports (no path aliasing initially)

### Step 3: Component Migration (2-3 hours)

**For each component, add client directive:**
```tsx
'use client'

import React from 'react'
// ... rest of imports
```

**Required for:**
- ✅ `DesignWorkspace.tsx` (useState, useEffect, Canvas API)
- ✅ `PatternPDF.tsx` (document.createElement)
- ✅ `ProjectCreation.tsx` (useState, forms)

**Checklist per component:**
- [ ] Add `'use client'` at top
- [ ] Test imports resolve
- [ ] Verify no server-side code
- [ ] Check browser API usage has guards

### Step 4: Static Export Configuration (15 min)

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Step 5: Testing (1-2 hours)

**Test locally:**
```bash
npm run dev          # Test dev mode
npm run build        # Test production build
npx serve@latest out # Test static export
```

**Manual testing checklist:**
- [ ] Project creation works
- [ ] Motif library loads (all 25+ motifs)
- [ ] Grid rendering works
- [ ] Drag & drop motifs
- [ ] Edge patterns apply
- [ ] Manual fill tools work
- [ ] PDF export generates correctly
- [ ] Front/back side switching
- [ ] Undo/redo functionality
- [ ] Grid size adjustment
- [ ] Color picker
- [ ] Text motif creation
- [ ] Image upload

### Step 6: Render Deployment (30 min)

**Create `render.yaml`:**
```yaml
services:
  - type: web
    name: hekle-app
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./out
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

**Deploy steps:**
1. Push to GitHub branch: `feat/nextjs-migration`
2. Connect Render to GitHub repo
3. Select static site
4. Set build command: `npm run build`
5. Set publish directory: `out`
6. Deploy

**Render configuration:**
- **Type**: Static Site
- **Branch**: `feat/nextjs-migration`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `out`
- **Auto-Deploy**: Yes

---

## Phase 2: Web Service (Future)

### Goals (when user feedback requires it)
- User accounts & authentication
- Save/load projects to database
- Share patterns with URLs
- Pattern gallery/marketplace
- Server-side PDF generation (optional)

### Migration Path
1. Remove `output: 'export'` from `next.config.js`
2. Add API routes in `app/api/`
3. Set up database (Render PostgreSQL)
4. Deploy as Render Web Service
5. Add environment variables

**No rewrite needed** - just enable features!

---

## Compatibility Matrix

| Feature | Vite React | Next.js Static | Next.js Service |
|---------|------------|----------------|-----------------|
| PDF Generation | ✅ Client | ✅ Client | ✅ Both |
| Canvas Rendering | ✅ | ✅ | ✅ |
| Drag & Drop | ✅ | ✅ | ✅ |
| State Management | ✅ Zustand | ✅ Zustand | ✅ Zustand |
| Image Upload | ✅ Local | ✅ Local | ✅ + Server |
| Save Projects | ❌ | ❌ | ✅ Database |
| User Accounts | ❌ | ❌ | ✅ Auth |
| Sharing | ❌ | ❌ | ✅ URLs |

---

## Risk Assessment

### Low Risk
- ✅ All dependencies are Next.js compatible
- ✅ No server-side rendering required
- ✅ Client-side features work identically
- ✅ Static export is well-supported

### Medium Risk
- ⚠️ Canvas API usage (mitigated with 'use client')
- ⚠️ File upload flow (works in static, but local only)
- ⚠️ PDF generation bundle size (may increase initial load)

### Mitigation Strategies
1. **Bundle size**: Use Next.js dynamic imports for PDF library
2. **Canvas API**: Ensure all Canvas components are client components
3. **Testing**: Comprehensive manual testing before deployment

---

## Timeline Estimate

| Task | Time | When |
|------|------|------|
| Phase 1 Setup | 30 min | Day 1 |
| File Migration | 1 hour | Day 1 |
| Component Updates | 2-3 hours | Day 1-2 |
| Configuration | 15 min | Day 2 |
| Testing | 1-2 hours | Day 2 |
| Deployment | 30 min | Day 2 |
| **Phase 1 Total** | **5-7 hours** | **1-2 days** |
| | | |
| Phase 2 Planning | 2 hours | When needed |
| Database Setup | 2 hours | When needed |
| API Development | 8-16 hours | When needed |
| Auth Integration | 4-8 hours | When needed |
| **Phase 2 Total** | **16-28 hours** | **3-5 days** |

---

## Success Criteria

### Phase 1
✅ App deploys successfully on Render
✅ All features work identically to Vite version
✅ PDF export generates correctly
✅ Test users can access and use the app
✅ No console errors in production
✅ Acceptable load time (< 3s initial load)

### Phase 2 (Future)
✅ Users can save projects
✅ Projects persist across sessions
✅ Sharing URLs work
✅ Authentication is secure
✅ Database performance is good

---

## Rollback Plan

If Phase 1 fails:
1. Keep Vite version on GitHub
2. Deploy Vite build to Render as static site
3. Use `npm run build` output from `dist/` folder

**Render can host Vite builds too!** Next.js is preferred for future flexibility, but not required.

---

## Next Steps

1. ✅ Review this plan
2. ⏳ Get approval to proceed
3. ⏳ Execute Phase 1 migration
4. ⏳ Deploy to Render
5. ⏳ Share with test users
6. ⏳ Gather feedback
7. ⏳ Decide on Phase 2 timing

---

## Questions for Review

1. Should we keep Vite version in a separate branch?
2. Do you want a custom domain for Render deployment?
3. Any specific test scenarios to validate?
4. Budget/timeline constraints for Phase 1?

