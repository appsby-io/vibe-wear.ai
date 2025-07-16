# Claude Development Notes

## Project: vibe-wear - AI Custom Clothing Generation

### Current Status (2025-01-04)

#### Active Branches:
- `main` - Production branch (deployed to vibe-wear.ai)
- `test` - Testing branch (auto-deploys to Netlify preview)
- `fixes` - Legacy development branch

### OpenAI Model Migration: DALL-E 3 → gpt-image-1

#### What We Accomplished:
- ✅ Switched from DALL-E 3 to gpt-image-1 model in edge function
- ✅ Fixed edge function deployment by creating `netlify.toml`
- ✅ Improved error handling to show actual API errors instead of generic messages
- ✅ Fixed quality parameter (changed from 'standard'/'hd' to 'medium'/'high')
- ✅ Updated environment variable from `VITE_OPENAI_API_KEY` to `OPENAI_API_KEY_SERVER`
- ✅ Confirmed organization has gpt-image-1 access

#### Fixed Issues:
- ✅ Removed `response_format` parameter - gpt-image-1 doesn't support it
- ✅ Added base64 to data URL conversion in frontend
- ✅ Image generation now properly handles base64 responses

#### Latest Status:
- Image generation works with gpt-image-1
- API returns base64 data (b64_json field)
- Frontend converts base64 to data URLs for display
- Images display properly in the UI

#### Key Files Modified:
- `/netlify/edge-functions/generateImage.ts` - Changed model to gpt-image-1, updated quality params
- `/src/utils/imageGeneration.ts` - Improved error handling and logging
- `/src/hooks/useCart.ts` - Fixed circular dependency issue
- `/src/App.tsx` - Added support for VITE_GA_ID environment variable
- `netlify.toml` - Created for proper edge function deployment

#### Environment Variables Required in Netlify:
- `OPENAI_API_KEY_SERVER` - OpenAI API key with gpt-image-1 access
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_GA_ID` - Google Analytics ID

#### Important Notes:
- gpt-image-1 requires organization verification (completed ✅)
- gpt-image-1 uses different quality parameters than DALL-E 3:
  - DALL-E 3: 'standard', 'hd'
  - gpt-image-1: 'low', 'medium', 'high', 'auto'
- The edge function is deployed at `/.netlify/edge-functions/generateImage`

#### Image Generation Quality Strategy:
- Use high quality only if users want to go to checkout
- Use low or medium quality for standard image generation

#### Commands to Run:
```bash
# When returning to this work:
git checkout fixes
git pull origin fixes

# After making changes:
npm run lint
npm run build
git add -A
git commit -m "Your commit message"
git push origin fixes
```

## IMPORTANT: Git Branch Policy

**NEVER push directly to the main/production branch!**

- All changes should be pushed to the `test` branch first
- Only push to `main` when explicitly requested by the user
- Default workflow:
  1. Make changes on test branch
  2. Push to test branch
  3. Test on test deployment
  4. Only merge/push to main when user explicitly says "push to production" or similar

```bash
# Default workflow
git checkout test
# ... make changes ...
git add -A
git commit -m "Your changes"
git push origin test  # ALWAYS push to test first

# Only when explicitly requested:
# git checkout main
# git merge test
# git push origin main
```

### Testing Notes:
- Preview deployment URL format: `fixes--yoursite.netlify.app`
- Check browser console for detailed error logs
- Check Netlify Functions tab for server-side logs

## Recent Development Timeline (2025-01-04)

### 1. Git Repository Setup & Deployment
- ✅ Initialized git repository and pushed to GitHub
- ✅ Created main and test branches
- ✅ Set up Netlify deployment with automatic deploys from test branch
- ✅ Established branch protection policy (never push to main directly)

### 2. Production 403 Error Resolution
- **Issue**: Main branch had 403 errors while test branch worked
- **Root Cause**: gpt-image-1 model access issues
- **Solution**: Implemented automatic fallback from gpt-image-1 to DALL-E 3
- **Additional Fix**: Resolved Image constructor naming conflict (Image → ImageIcon)

### 3. Reference Image Feature Implementation (Currently Disabled)

#### Initial Implementation:
- ✅ Added drag-and-drop reference image upload
- ✅ Redesigned UI to match ChatGPT style (image preview inside input field)
- ✅ Implemented image compression (max 800x800px) to reduce payload size
- ✅ Added image preview with remove button

#### Style Transfer Attempt:
- ✅ Created `/netlify/edge-functions/analyzeImage.ts` using GPT-4o-mini
- ✅ Implemented artistic style extraction (not content description)
- ✅ Added style analysis to override selected style when reference image present
- ❌ Results were poor - OpenAI doesn't support true style transfer

#### Feature Toggle:
- ✅ Added feature flag system in `/src/store/useFeature.ts`
- ✅ Set `referenceImage: false` to disable the feature
- ✅ Restored "Coming soon 🦘" tooltip when disabled
- ✅ Feature can be re-enabled by changing one boolean value

### 4. Key Technical Decisions

#### Model Fallback Strategy:
```typescript
// In generateImage.ts
if (apiRes.status === 403 || apiRes.status === 404) {
  // Fallback to DALL-E 3 if gpt-image-1 fails
  requestBody = {
    model: "dall-e-3",
    prompt: enhancedPrompt,
    quality: quality === 'hd' ? 'hd' : 'standard',
    n: 1,
    size: "1024x1024"
  };
}
```

#### Feature Toggle System:
```typescript
// In useFeature.ts
features: {
  betaGate: import.meta.env.VITE_FEATURE_BETA_GATE === 'on',
  referenceImage: false, // Toggle this to enable/disable
}
```

### 5. Current Architecture

#### Edge Functions:
1. `/netlify/edge-functions/generateImage.ts`
   - Handles image generation with model fallback
   - Supports both gpt-image-1 and DALL-E 3

2. `/netlify/edge-functions/analyzeImage.ts`
   - Analyzes reference images for artistic style
   - Uses GPT-4o-mini for cost efficiency
   - Currently unused (feature toggled off)

#### Key Components:
1. `AIGenerator.tsx` - Main UI component with ChatGPT-style input
2. `imageGeneration.ts` - Core generation logic and prompt enhancement
3. `useFeature.ts` - Feature toggle management

### 6. Lessons Learned

#### OpenAI Limitations:
- No native style transfer support
- DALL-E 3 cannot accept image inputs
- GPT-4 Vision can analyze but not generate images
- Text descriptions of style don't translate well to visual style

#### Alternative Approaches (Not Implemented):
- Stable Diffusion with ControlNet (requires self-hosting)
- Midjourney API (no official API available)
- Fine-tuned models (expensive per style)

### 7. Environment Variables

#### Required in Netlify:
- `OPENAI_API_KEY_SERVER` - OpenAI API key
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_GA_ID` - Google Analytics ID

### 8. Quick Reference Commands

```bash
# Daily workflow
git checkout test
npm run lint        # Always lint before committing
npm run build       # Verify build succeeds
git add -A
git commit -m "Your descriptive message"
git push origin test

# Re-enable reference image feature
# Edit src/store/useFeature.ts
# Change: referenceImage: false → referenceImage: true

# View logs
# Netlify dashboard → Functions tab → View logs
```

### 9. Next Steps When Reference Image Feature is Re-enabled

1. Consider adding UI text explaining limitations
2. Build a library of pre-analyzed styles
3. Add user feedback mechanism for style matching
4. Investigate newer models as they become available

### 10. Important Files Reference

- Git policy: `/CLAUDE.md` (this file) - line 65-89
- Model fallback: `/netlify/edge-functions/generateImage.ts` - line 73-86
- Feature toggle: `/src/store/useFeature.ts` - line 12
- Reference image UI: `/src/components/AIGenerator.tsx` - line 34, 119-125, 228-237
- Style analysis: `/netlify/edge-functions/analyzeImage.ts`
- Analysis docs: `/REFERENCE_IMAGE_ANALYSIS.md`
```