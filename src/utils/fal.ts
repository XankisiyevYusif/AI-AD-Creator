import * as fal from '@fal-ai/serverless-client';

// Initialize the Fal AI client with the API key
fal.config({
  credentials: import.meta.env.VITE_FAL_KEY || import.meta.env.FAL_KEY
});

export { fal };