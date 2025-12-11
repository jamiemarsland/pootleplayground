export async function uploadBlueprintAndGetStudioUrl(blueprint: any): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiUrl = `${supabaseUrl}/functions/v1/serve-blueprint/store`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ blueprint }),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload blueprint: ${response.statusText}`);
    }

    const { url } = await response.json();

    const encodedUrl = encodeURIComponent(url);
    return `https://wp.com/open?deep_link=add-site%3Fblueprint_url%3D${encodedUrl}`;
  } catch (error) {
    console.error('Error uploading blueprint:', error);
    throw error;
  }
}
