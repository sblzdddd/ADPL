
// Freeimage.host API configuration
const config = useRuntimeConfig();
const FREEIMAGE_API_KEY = config.freeimage.apiKey;
const FREEIMAGE_API_URL = 'https://freeimage.host/api/1/upload';

export async function uploadToFreeimage(file: File) {
  const formData = new FormData();
  formData.append('key', FREEIMAGE_API_KEY);
  formData.append('action', 'upload');
  formData.append('source', file);
  formData.append('format', 'json');

  try {
    const response = await fetch(FREEIMAGE_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status_code !== 200 || !result.success) {
      throw new Error(result.status_txt || 'Upload failed');
    }

    return {
      url: result.image.url,
      thumbnailUrl: result.image.thumb?.url,
      mediumUrl: result.image.medium?.url,
      size: result.image.size,
      width: result.image.width,
      height: result.image.height,
      originalFilename: result.image.original_filename,
    };
  } catch (error) {
    console.error('Error uploading to freeimage.host:', error);
    throw new Error('Failed to upload image to external service');
  }
}