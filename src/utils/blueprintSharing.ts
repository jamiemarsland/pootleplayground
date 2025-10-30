import { supabase } from '../lib/supabase';

export interface SharedLink {
  id: string;
  short_code: string;
  blueprint_id: string | null;
  full_url: string;
  blueprint_data: any;
  created_at: string;
  created_by: string;
  click_count: number;
  last_accessed_at: string | null;
}

export async function fetchBlueprintById(blueprintId: string) {
  const { data, error } = await supabase
    .from('blueprints')
    .select('*')
    .eq('id', blueprintId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch blueprint: ${error.message}`);
  }

  if (!data) {
    throw new Error('Blueprint not found');
  }

  return data;
}

export async function createShareableLink(blueprintId: string, blueprintData: any) {
  const shortCode = generateShortCode();
  const playgroundUrl = generatePlaygroundUrl(blueprintData);

  const { data, error } = await supabase
    .from('shared_links')
    .insert({
      short_code: shortCode,
      blueprint_id: blueprintId,
      full_url: playgroundUrl,
      blueprint_data: blueprintData
    })
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to create shareable link: ${error.message}`);
  }

  return data;
}

export async function fetchSharedLink(shortCode: string) {
  const { data, error } = await supabase
    .from('shared_links')
    .select('*')
    .eq('short_code', shortCode)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch shared link: ${error.message}`);
  }

  if (!data) {
    throw new Error('Shared link not found');
  }

  await incrementClickCount(shortCode);

  return data;
}

export async function incrementClickCount(shortCode: string) {
  const { error } = await supabase.rpc('increment_click_count', {
    p_short_code: shortCode
  });

  if (error) {
    console.error('Failed to increment click count:', error);
  }
}

export function generateShortCode(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generatePlaygroundUrl(blueprintData: any): string {
  const { generateBlueprint } = require('./blueprintGenerator');

  const nativeBlueprint = generateBlueprint(
    blueprintData.steps,
    blueprintData.blueprintTitle,
    blueprintData.landingPageType,
    blueprintData.customLandingUrl
  );

  const blueprintJson = JSON.stringify(nativeBlueprint);
  const compressed = btoa(blueprintJson);
  return `https://playground.wordpress.net/#${compressed}`;
}

export function generateShareableUrl(blueprintId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/blueprint/${blueprintId}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
