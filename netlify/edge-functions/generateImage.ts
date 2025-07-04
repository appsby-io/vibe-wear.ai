// Edge function for secure OpenAI image generation

declare global {
  const Netlify: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

export default async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    // Read the request JSON
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    const { prompt, quality = 'standard', size = '1024x1024', referenceImage } = requestData;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Get API key from environment
    const apiKey = Netlify.env.get("OPENAI_API_KEY_SERVER");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // If reference image is provided, enhance the prompt
    let enhancedPrompt = prompt;
    if (referenceImage) {
      // Note: Current OpenAI models don't support direct image input
      // We'll enhance the prompt to mention the reference
      console.log('Reference image provided, size:', referenceImage.length);
      enhancedPrompt = `${prompt}. (User has provided a reference image for style/motif guidance)`;
    }
    
    // Try gpt-image-1 first, fallback to dall-e-3 if needed
    let requestBody: Record<string, unknown> = {
      model: "gpt-image-1",
      prompt: enhancedPrompt,
      quality: quality === 'hd' ? 'high' : 'medium',
      n: 1,
      size
    };
    
    console.log('Trying gpt-image-1:', requestBody);
    
    let apiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    // If gpt-image-1 fails with 403/404, try DALL-E 3
    if (apiRes.status === 403 || apiRes.status === 404) {
      console.log('gpt-image-1 failed with', apiRes.status, ', falling back to dall-e-3');
      
      requestBody = {
        model: "dall-e-3",
        prompt: enhancedPrompt,
        quality: quality === 'hd' ? 'hd' : 'standard',
        n: 1,
        size: "1024x1024" // DALL-E 3 is strict about sizes
      };
      
      apiRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
    }

    if (!apiRes.ok) {
      let errorDetails = {};
      try {
        errorDetails = await apiRes.json();
      } catch {
        const errorText = await apiRes.text();
        errorDetails = { message: errorText };
      }
      
      console.error('OpenAI API error:', apiRes.status, errorDetails);
      
      return new Response(
        JSON.stringify({ 
          error: errorDetails.error?.message || errorDetails.message || `OpenAI API error: ${apiRes.status}`,
          details: errorDetails
        }),
        { 
          status: apiRes.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Forward the JSON payload ({ created, data:[{url|b64_json}] })
    const data = await apiRes.json();
    return new Response(JSON.stringify(data), {
      headers: { 
        "content-type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
};
