// Edge function to analyze reference images using GPT-4 Vision

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
    const { image, userPrompt } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
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

    // Call GPT-4 Vision API to analyze the image
    const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing visual art styles for AI image generation. Your goal is to extract the ARTISTIC STYLE, not the content. Focus on HOW things are drawn/painted, not WHAT is shown."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this reference image and create a detailed style guide for AI image generation. The user wants to create: "${userPrompt}" in this exact artistic style.

Focus ONLY on style elements:
1. Art medium/technique (e.g., watercolor, oil painting, digital art, pencil sketch)
2. Artistic style movement (e.g., impressionism, pop art, anime, photorealism)
3. Color treatment (vibrant/muted, color harmony, saturation levels)
4. Brushwork/line quality (smooth, textured, bold, delicate)
5. Lighting style (dramatic, soft, flat, chiaroscuro)
6. Level of detail and stylization
7. Any unique artistic characteristics

DO NOT describe what objects are in the image. We only care about HOW they are rendered artistically.

Format your response as a concise artistic style description that can be used directly in an image generation prompt.`
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                  detail: "high" // Use high detail for better style analysis
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!visionResponse.ok) {
      const error = await visionResponse.json();
      console.error('GPT-4 Vision error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to analyze image',
          details: error
        }),
        { 
          status: visionResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    const visionData = await visionResponse.json();
    const imageDescription = visionData.choices[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ 
        description: imageDescription,
        usage: visionData.usage
      }),
      {
        headers: { 
          "content-type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      }
    );

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