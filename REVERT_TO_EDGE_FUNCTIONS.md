# How to Revert to Edge Functions

If the regular Netlify Functions don't work as expected, you can easily revert to Edge Functions:

## Quick Revert (1 line change)

1. Open `/src/store/useFeature.ts`
2. Change line 13 from:
   ```typescript
   useRegularFunctions: true,
   ```
   to:
   ```typescript
   useRegularFunctions: false,
   ```

That's it! The app will immediately switch back to using Edge Functions.

## What This Change Does

- **With `useRegularFunctions: true`** (current):
  - Uses `/.netlify/functions/generateImageAPI`
  - 10-second timeout (26s on Pro plans)
  - Slightly higher latency
  - Should handle OpenAI API calls without 502 errors

- **With `useRegularFunctions: false`** (original):
  - Uses `/.netlify/edge-functions/generateImage`
  - 50ms CPU execution limit
  - Lower latency but causes 502 errors with OpenAI

## Complete Removal (if needed)

To completely remove the regular function setup:

1. Delete `/netlify/functions/generateImageAPI.js`
2. Remove the feature flag from `/src/store/useFeature.ts`
3. Remove the conditional logic from `/src/utils/imageGeneration.ts` (lines 218-224)
4. Change line 227 back to: `const response = await fetch('/.netlify/edge-functions/generateImage', {`

## Files Changed

- `/netlify/functions/generateImageAPI.js` - New regular function
- `/src/store/useFeature.ts` - Added feature toggle
- `/src/utils/imageGeneration.ts` - Added conditional endpoint selection

## No Breaking Changes

- Edge functions remain untouched
- No API changes
- No UI changes
- Easy to switch back and forth