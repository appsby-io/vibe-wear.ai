// Regular Netlify Function for OpenAI image generation
// This has a 10-second timeout (26 seconds on Pro plans)

exports.handler = async (event, context) => {
  console.log('Function started, Node version:', process.version);
  console.log('Environment check - API Key exists:', !!process.env.OPENAI_API_KEY_SERVER);
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { prompt, quality = 'standard', size = '1024x1024' } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY_SERVER;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    console.log('Generating image with prompt length:', prompt.length);
    console.log('Starting generation at:', new Date().toISOString());
    console.log('Quality:', quality, 'Size:', size);

    // Always use gpt-image-1 with low quality for faster generation
    let requestBody = {
      model: "gpt-image-1",
      prompt: prompt,
      quality: 'low', // Force low quality to reduce generation time
      n: 1,
      size: size
    };

    // Add AbortController for timeout handling (24 seconds for Pro plan, with 2s buffer)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 24000);
    
    let response;
    try {
      response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted after 24 seconds');
        return {
          statusCode: 504,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            error: 'Image generation is taking too long. Please try with a simpler prompt or use standard quality.',
            timeout: true
          })
        };
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    // Fallback to DALL-E 3 if gpt-image-1 fails
    if (response.status === 403 || response.status === 404) {
      console.log('Falling back to DALL-E 3');
      
      requestBody = {
        model: "dall-e-3",
        prompt: prompt,
        quality: quality === 'hd' ? 'hd' : 'standard',
        n: 1,
        size: "1024x1024"
      };

      response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('OpenAI API error:', response.status, error);
      
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: error.error?.message || error.message || `OpenAI API error: ${response.status}`,
          details: error
        })
      };
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Function error:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        type: error.constructor.name,
        stack: error.stack,
        nodeVersion: process.version
      })
    };
  }
};