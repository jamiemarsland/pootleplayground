import { supabase } from '../lib/supabase';
import { getUserId } from './userManager';

const CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SHORT_CODE_LENGTH = 7;
const BASE_DOMAIN = window.location.origin;

function generateShortCode(): string {
  let result = '';
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return result;
}

export async function createShortLink(
  fullUrl: string,
  blueprintId?: string,
  blueprintData?: any
): Promise<{ success: boolean; shortCode?: string; shortUrl?: string; error?: string }> {
  const userId = getUserId();
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const shortCode = generateShortCode();

    try {
      const { data, error } = await supabase
        .from('shared_links')
        .insert({
          short_code: shortCode,
          blueprint_id: blueprintId || null,
          full_url: fullUrl,
          blueprint_data: blueprintData || null,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          attempts++;
          continue;
        }
        throw error;
      }

      const shortUrl = `${BASE_DOMAIN}/p/${shortCode}`;
      return { success: true, shortCode, shortUrl };
    } catch (error) {
      console.error('Error creating short link:', error);
      if (attempts >= maxAttempts - 1) {
        return { success: false, error: 'Failed to generate unique short code' };
      }
      attempts++;
    }
  }

  return { success: false, error: 'Failed to create short link after multiple attempts' };
}

export async function getFullUrlFromShortCode(shortCode: string): Promise<{
  success: boolean;
  fullUrl?: string;
  blueprintData?: any;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('shared_links')
      .select('full_url, blueprint_data')
      .eq('short_code', shortCode)
      .single();

    if (error || !data) {
      return { success: false, error: 'Short link not found' };
    }

    await supabase
      .from('shared_links')
      .update({
        click_count: supabase.rpc('increment', { row_id: shortCode }),
        last_accessed_at: new Date().toISOString(),
      })
      .eq('short_code', shortCode);

    return {
      success: true,
      fullUrl: data.full_url,
      blueprintData: data.blueprint_data,
    };
  } catch (error) {
    console.error('Error retrieving short link:', error);
    return { success: false, error: 'Failed to retrieve link' };
  }
}

export async function getUserSharedLinks(): Promise<{
  success: boolean;
  links?: Array<{
    id: string;
    short_code: string;
    full_url: string;
    blueprint_id?: string;
    created_at: string;
    click_count: number;
    last_accessed_at?: string;
  }>;
  error?: string;
}> {
  const userId = getUserId();

  try {
    const { data, error } = await supabase
      .from('shared_links')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, links: data || [] };
  } catch (error) {
    console.error('Error fetching user shared links:', error);
    return { success: false, error: 'Failed to fetch shared links' };
  }
}

export async function deleteSharedLink(shortCode: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const userId = getUserId();

  try {
    const { error } = await supabase
      .from('shared_links')
      .delete()
      .eq('short_code', shortCode)
      .eq('created_by', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting shared link:', error);
    return { success: false, error: 'Failed to delete link' };
  }
}

export function getShortUrlDisplay(shortCode: string): string {
  return `pootleplayground/${shortCode}`;
}
