import { supabase } from '../lib/supabase';
import { getUserId } from './userManager';

export async function uploadScreenshot(file: File): Promise<string> {
  const userId = getUserId();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('blueprint-screenshots')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload screenshot: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('blueprint-screenshots')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPG, PNG, WebP, or GIF)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image must be smaller than 5MB'
    };
  }

  return { valid: true };
}
