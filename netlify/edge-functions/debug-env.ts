// Debug edge function to check environment variables
export default async (req: Request) => {
  // Only allow this in non-production or with secret header
  const debugSecret = req.headers.get('X-Debug-Secret');
  
  try {
    const apiKey = Netlify.env.get("OPENAI_API_KEY_SERVER");
    const hasApiKey = !!apiKey;
    const keyPrefix = apiKey ? apiKey.substring(0, 7) + '...' : 'NOT SET';
    
    // Test API key by making a simple models request
    let apiTestResult = 'Not tested';
    if (hasApiKey && debugSecret === 'debug-vibe-wear-2024') {
      try {
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        apiTestResult = `Status: ${testResponse.status}`;
      } catch (e) {
        apiTestResult = `Error: ${e.message}`;
      }
    }
    
    return new Response(JSON.stringify({
      environment: {
        hasApiKey,
        keyPrefix,
        apiTestResult,
        deployContext: Netlify.env.get("CONTEXT") || 'unknown',
        branch: Netlify.env.get("BRANCH") || 'unknown',
        url: Netlify.env.get("URL") || 'unknown',
        deployUrl: Netlify.env.get("DEPLOY_URL") || 'unknown',
      },
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};