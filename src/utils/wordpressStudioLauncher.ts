export function generateWordPressStudioUrl(playgroundUrl: string): string {
  const encodedUrl = encodeURIComponent(playgroundUrl);
  return `https://wp.com/open?deep_link=add-site%3Fblueprint_url%3D${encodedUrl}`;
}
