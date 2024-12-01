import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export async function uploadNovelCover(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('novel_covers')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('novel_covers')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading novel cover:', error);
    throw error;
  }
}