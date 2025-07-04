// Background removal service configuration
// Since DALL-E 3 doesn't support transparent backgrounds, we need a separate service

export const BACKGROUND_REMOVAL_SERVICES = {
  removeBg: {
    name: 'remove.bg',
    apiUrl: 'https://api.remove.bg/v1.0/removebg',
    pricing: 'Credit-based, ~$0.20 per image',
    features: ['High quality', 'Up to 50MP', 'ZIP format support'],
    documentation: 'https://www.remove.bg/api'
  },
  photoroom: {
    name: 'Photoroom',
    apiUrl: 'https://sdk.photoroom.com/v1/segment',
    pricing: 'Free tier available',
    features: ['Fast processing', 'Multiple formats', 'Batch processing'],
    documentation: 'https://www.photoroom.com/api'
  }
};

// For MVP, we'll generate images with simple backgrounds that are easier to remove
// Later integration can add automatic background removal
export const BACKGROUND_REMOVAL_NOTE = `
Note: The generated images are optimized for easy background removal. 
For transparent PNGs, we recommend using services like:
- remove.bg (https://www.remove.bg)
- Photoroom (https://www.photoroom.com/tools/background-remover)
- Adobe Express (https://www.adobe.com/express/feature/image/remove-background)
`;