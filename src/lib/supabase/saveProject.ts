// /lib/supabase/saveProject.ts
import { getSupabaseClient } from '@/lib/supabase/client';

export async function saveJsonToSupabase(
  userId: string,
  projectId: string,
  fileName: string,
  data: any
) {
  const supabase = getSupabaseClient();
  const path = `${userId}/${projectId}/${fileName}`;

  const { error } = await supabase.storage
    .from('carousels')
    .upload(path, JSON.stringify(data, null, 2), {
      upsert: true,
      contentType: 'application/json',
    });

  if (error) throw error;
}
