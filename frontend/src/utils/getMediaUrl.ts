/**
 * Get the full URL for a media file
 * @param path - The relative path or full URL of the media file
 * @returns The full URL for the media file
 */
export function getMediaUrl(path: string | undefined | null): string {
  if (!path) return 'https://via.placeholder.com/150';
  
  // If it's already a full URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a relative path, prepend the backend URL
  // In development, backend runs on port 8000
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${backendUrl}/${cleanPath}`;
} 