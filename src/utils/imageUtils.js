// Image path utilities for HALT Shelter website
// This file helps manage image paths and provides fallbacks

// Story image mapping - update these paths once real images are added
export const storyImages = {
  'bellas-second-chance': '/images/stories/bella-second-chance.jpg',
  'emergency-kitten-rescue': '/images/stories/emergency-kitten-rescue.jpg',
  'maxs-medical-miracle': '/images/stories/max-medical-miracle.jpg',
  'lunas-journey-home': '/images/stories/luna-journey-home.jpg',
  'highway-heroes': '/images/stories/highway-heroes.jpg',
  'charlies-cancer-battle': '/images/stories/charlie-cancer-battle.jpg'
};

// Default placeholder SVG for when images are not found
export const defaultPlaceholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=";

// Function to get story image with fallback
export const getStoryImage = (slug) => {
  return storyImages[slug] || defaultPlaceholder;
};

// Function to check if image exists (you can enhance this later)
export const imageExists = async (imagePath) => {
  try {
    const response = await fetch(imagePath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Function to get image with existence check
export const getImageWithFallback = async (slug) => {
  const imagePath = storyImages[slug];
  if (imagePath && imagePath !== defaultPlaceholder) {
    const exists = await imageExists(imagePath);
    return exists ? imagePath : defaultPlaceholder;
  }
  return defaultPlaceholder;
};
