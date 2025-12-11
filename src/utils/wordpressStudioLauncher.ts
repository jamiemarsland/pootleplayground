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

    console.log('Blueprint stored at:', url);
    console.log('Opening WordPress Studio with URL:', url);

    const encodedUrl = encodeURIComponent(url);
    const deepLink = `https://playground.wordpress.net/?blueprint-url=${encodedUrl}`;
    console.log('Final deep link:', deepLink);

    return deepLink;
  } catch (error) {
    console.error('Error uploading blueprint:', error);
    throw error;
  }
}
