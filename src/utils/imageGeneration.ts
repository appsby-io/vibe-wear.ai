// src/utils/imageGeneration.ts
// import { logPromptToDatabase } from './promptLogger'; // Temporarily disabled

// Validation function for prompts
export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt || prompt.trim().length === 0) {
    return {
      valid: false,
      error: 'Please enter a description for your design'
    };
  }

  if (prompt.length > 1000) {
    return {
      valid: false,
      error: 'Prompt is too long. Please keep it under 1000 characters.'
    };
  }

  const inappropriateTerms = ['nsfw', 'explicit', 'nude', 'sexual', 'violence', 'gore', 'hate'];
  const lowerPrompt = prompt.toLowerCase();

  for (const term of inappropriateTerms) {
    if (lowerPrompt.includes(term)) {
      return {
        valid: false,
        error: 'Please use appropriate content for your design'
      };
    }
  }

  return { valid: true };
}

const contentGuidelines = "no offensive content, no copyrighted images, no real people or celebrities";

// T-shirt optimized style prompts
const STYLE_PROMPTS: Record<string, string> = {
  cartoonblocks: "Vector-style 3D cartoon t-shirt design. Simplified blocky character as the main focal point, isolated on minimal background. Bold, chunky shapes with flat colors - bright primary colors that pop. Clean black outlines, no complex shading. Character takes up 70% of composition. Perfect for screen printing on apparel. No photorealism, no gradients, no complex backgrounds.",
  
  cyberpunk: "Bold cyberpunk t-shirt graphic design. Main subject with neon glow effects - cyan, magenta, electric blue accents. High contrast design with deep blacks and bright neons. Simplified futuristic elements, clean vector-style illustration. Subject isolated on dark or minimal background. Strong silhouette that reads well on fabric. No complex environments, focus on iconic cyberpunk imagery.",
  
  comic: "Vintage comic book style t-shirt design. Bold illustration with thick black ink outlines, flat colors, halftone dot patterns. Dynamic character or subject as focal point. Limited color palette - primary colors plus black. Clean, readable design that works at any size. Isolated subject on simple background. Comic book aesthetic without complex panels or environments.",
  
  watercolor: "Artistic watercolor t-shirt design. Main subject rendered in soft watercolor style with visible brush strokes. Limited color bleeds, controlled paint effects. Subject stands out clearly despite artistic style. Minimal or white background for easy printing. Balance between artistic expression and t-shirt wearability. No muddy colors or overly complex washes.",
  
  realistic: "Photorealistic t-shirt design with isolated subject. High-detail rendering of main element only. Strong contrast and clear focal point. Subject appears to 'pop' off the shirt. Minimal or removable background. Professional quality suitable for direct-to-garment printing. Focus on one impressive realistic element rather than complex scenes.",
  
  "black-and-white": "High contrast black and white t-shirt design. Bold graphic with strong silhouette. Uses only pure black and white - no grays. Dramatic shadows and highlights. Subject isolated on opposite color background (black on white or white on black). Perfect for single-color screen printing. Clean, striking design that works on any color garment.",
  
  botanical: "Elegant botanical t-shirt design. Hand-drawn style illustration of plants/flowers as main subject. Clean line work with minimal shading. Scientific illustration aesthetic but simplified for apparel. Centered composition with botanical element as hero. Works well on light or dark garments. No complex backgrounds, focus on botanical beauty.",
  
  "cartoon-avatar": "Fun cartoon character t-shirt design. Single character with exaggerated features, big personality. Bold outlines, flat colors, minimal shading. Character isolated on simple background. Expressive and memorable design. Works like a logo or mascot on apparel. Clean vector style that scales well.",
  
  "childrens-book": "Whimsical children's illustration style t-shirt design. Soft, friendly character or scene. Limited pastel color palette. Simple, joyful design that appeals to all ages. Main subject clearly defined. Minimal background elements. Hand-drawn quality but clean enough for printing. Positive, uplifting imagery.",
  
  grunge: "Edgy grunge t-shirt design. Distressed textures on main graphic element. High contrast - primarily black with accent colors. Raw, rebellious aesthetic. Bold central image with rough edges. Vintage band t-shirt inspired. Works well on black or dark colored shirts. Strong visual impact.",
  
  "vintage-comic": "Retro comic book t-shirt design in black and white. Bold ink style illustration. Heavy shadows, dynamic poses. Single powerful image, not a full comic panel. High contrast for impactful design. Works like vintage band merch or retro poster art. Clean composition despite detailed linework."
};

// T-shirt design technical specifications
const technicalSpecs = "High resolution vector-style design, professional quality optimized for t-shirt printing, centered composition with clean edges. Subject isolated and prominent, taking up 60-80% of the frame. Simple, clean background that can be easily removed. No complex backgrounds, no photographic backgrounds, no gradients in background. Bold, clear design elements suitable for screen printing or DTG printing.";

// Additional t-shirt design guidelines
const tshirtDesignGuidelines = "Create a design that works as a standalone graphic on apparel. Focus on the main subject with high contrast. Use bold, confident strokes and shapes. Ensure design reads well from a distance. Avoid tiny details that won't print well. Design should be eye-catching and memorable.";

// Common t-shirt design issues to avoid
const avoidancePrompt = "AVOID: photographic backgrounds, complex gradients in background, multiple scattered elements, text unless specifically requested, realistic environments, busy compositions. FOCUS ON: single strong focal point, clean composition, bold graphics.";

function getBackgroundInstruction(productColor: string): string {
  const colorLower = productColor.toLowerCase();
  
  // T-shirt specific design instructions based on garment color
  if (colorLower.includes('black')) {
    return "T-shirt design for BLACK garment: Subject isolated on minimal dark background for easy removal. Use bright, vibrant colors (white, neon, pastels) that pop against black fabric. Strong contrast is essential. Bold graphic with light elements. Avoid dark colors that disappear on black shirts. Design should glow against dark background.";
  } else if (colorLower.includes('white')) {
    return "T-shirt design for WHITE garment: Subject isolated on minimal light background for easy removal. Use bold, saturated colors and strong black outlines that stand out on white fabric. Rich, deep colors work best. Avoid light pastels or white elements that vanish on white shirts. High contrast graphic design.";
  } else {
    return "T-shirt design for COLORED garment: Subject isolated on neutral background for easy removal. Use high contrast colors that complement the shirt color. Strong, bold design that remains visible. Consider both light and dark elements for versatility. Clear, impactful graphic that works on colored fabric.";
  }
}

// Preprocess user prompts to be more t-shirt design friendly
function preprocessPromptForTshirt(userPrompt: string): string {
  let processed = userPrompt.trim();
  
  // Add design context if the prompt is too simple
  const simpleWords = ['cat', 'dog', 'lion', 'tiger', 'eagle', 'wolf', 'bear', 'dragon', 'skull', 'flower', 'rose', 'mountain', 'tree'];
  const isSimplePrompt = simpleWords.some(word => processed.toLowerCase() === word);
  
  if (isSimplePrompt) {
    // Enhance simple one-word prompts
    processed = `stylized ${processed} graphic design`;
  }
  
  // Replace problematic phrases
  processed = processed
    .replace(/photo of/gi, 'illustration of')
    .replace(/photograph of/gi, 'design of')
    .replace(/picture of/gi, 'graphic of')
    .replace(/realistic photo/gi, 'detailed illustration')
    .replace(/in a forest/gi, 'with decorative forest elements')
    .replace(/in the city/gi, 'with urban design elements')
    .replace(/at the beach/gi, 'with beach-themed elements');
  
  return processed;
}

function enhancePrompt(userPrompt: string, style: string, productColor: string, imageAnalysis: string | null = null): string {
  // Preprocess the prompt for t-shirt design
  const processedPrompt = preprocessPromptForTshirt(userPrompt);
  
  const cleanPrompt = processedPrompt
    .replace(/[^\w\s.,!?'-]/g, '')
    .replace(/\s+/g, ' ');

  const backgroundInstruction = getBackgroundInstruction(productColor);
  
  // Enhanced prompt structure for t-shirt designs
  const basePrompt = `Professional t-shirt design: ${cleanPrompt}`;
  
  if (imageAnalysis) {
    // When we have a reference image analysis, prioritize it over the selected style
    return `${basePrompt}. Artistic style: ${imageAnalysis}. ${backgroundInstruction}. ${technicalSpecs}. ${tshirtDesignGuidelines}. ${avoidancePrompt}. ${contentGuidelines}. IMPORTANT: Create a bold, isolated graphic design perfect for t-shirt printing with the main subject prominent and a simple, solid color or minimal gradient background that can be easily removed.`;
  } else {
    // Use the selected style when no reference image
    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.realistic;
    return `${basePrompt}. ${stylePrompt}. ${backgroundInstruction}. ${technicalSpecs}. ${tshirtDesignGuidelines}. ${avoidancePrompt}. ${contentGuidelines}. IMPORTANT: Create a bold, isolated graphic design perfect for t-shirt printing with the main subject prominent and a simple, solid color or minimal gradient background that can be easily removed.`;
  }
}

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  prompt?: string;
  revisedPrompt?: string;
  quality?: string;
  error?: string;
}

async function analyzeReferenceImage(image: string, userPrompt: string): Promise<string | null> {
  try {
    const response = await fetch('/.netlify/edge-functions/analyzeImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
        userPrompt
      })
    });

    if (!response.ok) {
      console.error('Failed to analyze reference image');
      return null;
    }

    const data = await response.json();
    return data.description;
  } catch (error) {
    console.error('Error analyzing reference image:', error);
    return null;
  }
}

export async function generateDesign(
  prompt: string,
  style: string,
  productColor: string,
  quality: 'low' | 'hd' = 'low',
  referenceImage?: string
): Promise<GenerationResult> {
  let imageAnalysis: string | null = null;
  
  // If reference image provided, analyze it first
  if (referenceImage) {
    console.log('Analyzing reference image...');
    imageAnalysis = await analyzeReferenceImage(referenceImage, prompt);
    console.log('Image analysis result:', imageAnalysis);
  }
  
  const enhancedPrompt = enhancePrompt(prompt, style, productColor, imageAnalysis);
  
  try {
    if (!prompt?.trim()) {
      // Temporarily disable logging to avoid 401 errors
      // await logPromptToDatabase({
      //   originalPrompt: prompt,
      //   enhancedPrompt,
      //   style,
      //   productColor,
      //   quality,
      //   success: false,
      //   errorMessage: 'Empty prompt provided'
      // });

      return {
        success: false,
        error: 'Please provide a design prompt'
      };
    }

    console.log('Enhanced prompt (gpt-image-1):', enhancedPrompt);

    // Use Netlify edge function for secure image generation
    const response = await fetch('/.netlify/edge-functions/generateImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        quality: quality === 'hd' ? 'hd' : 'standard',
        size: "1024x1024"
        // Note: Not sending referenceImage to avoid payload size issues
        // OpenAI doesn't support reference images anyway
      })
    });

    if (!response.ok) {
      let errorMessage = 'AI image generation is currently unavailable. Please try again later.';
      let errorDetails = '';
      
      try {
        const responseText = await response.text();
        try {
          const errorData = JSON.parse(responseText);
          errorDetails = errorData.details || '';
          
          // Provide more specific error messages
          if (errorData.error?.includes('API key not configured')) {
            errorMessage = 'Image generation service is not configured. Please contact support.';
          } else if (errorData.error?.includes('model_not_found') || errorData.error?.includes('gpt-image-1')) {
            errorMessage = 'The requested image model (gpt-image-1) is not available. You may need to apply for access or use dall-e-3 instead.';
          } else if (response.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = 'Authentication failed. Please check your API access.';
          } else if (errorData.error) {
            // Show the actual error from the API
            errorMessage = errorData.error;
          }
          
          console.error('Netlify function error:', errorData);
          console.error('Error details:', errorDetails);
        } catch {
          // Response wasn't JSON
          console.error('Netlify function error (text):', responseText);
          errorDetails = responseText;
        }
      } catch (e) {
        console.error('Failed to read error response:', e);
      }
      
      // Temporarily disable logging to avoid 401 errors
      /* await logPromptToDatabase({
        originalPrompt: prompt,
        enhancedPrompt,
        style,
        productColor,
        quality,
        success: false,
        errorMessage: `API Error: ${response.status} - ${errorDetails}`
      }); */

      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();
    console.log('API Response:', data);
    console.log('Image data structure:', data.data?.[0]);
    
    // gpt-image-1 returns base64 data
    const imageData = data.data?.[0];
    let imageUrl = imageData?.url;
    
    // If we get base64 data instead of a URL, convert it
    if (!imageUrl && imageData?.b64_json) {
      console.log('Converting base64 to data URL...');
      imageUrl = `data:image/png;base64,${imageData.b64_json}`;
    }
    
    console.log('Final image URL:', imageUrl ? 'Generated successfully' : 'Not found');
    
    if (!imageUrl) {
      console.error('No image URL found in response:', data);
      // Temporarily disable logging to avoid 401 errors
      /* await logPromptToDatabase({
        originalPrompt: prompt,
        enhancedPrompt,
        style,
        productColor,
        quality,
        success: false,
        errorMessage: 'No image was generated'
      }); */

      return {
        success: false,
        error: 'No image was generated'
      };
    }

    // Log successful generation
    /* await logPromptToDatabase({
      originalPrompt: prompt,
      enhancedPrompt,
      revisedPrompt: data.data?.[0]?.revised_prompt,
      style,
      productColor,
      quality,
      success: true,
      imageUrl
    }); */

    return {
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      revisedPrompt: data.data?.[0]?.revised_prompt,
      quality
    };

  } catch (error: unknown) {
    console.error('Image generation error:', error);

    // const errorMessage = error instanceof Error ? error.message : 'AI image generation is currently unavailable';

    // Log failed generation
    /* await logPromptToDatabase({
      originalPrompt: prompt,
      enhancedPrompt,
      style,
      productColor,
      quality,
      success: false,
      errorMessage
    }); */

    return {
      success: false,
      error: 'AI image generation is currently unavailable. Please try again later.'
    };
  }
}

export async function generateHDDesignForCheckout(
  prompt: string,
  style: string,
  productColor: string,
  referenceImage?: string
): Promise<GenerationResult> {
  return generateDesign(prompt, style, productColor, 'hd', referenceImage);
}