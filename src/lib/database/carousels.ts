import { getSupabaseClient } from '@/lib/supabase/client';
import { Carousel, CarouselStyle } from '@/types';

export interface DatabaseCarousel {
  id: string;
  user_id: string;
  title: string;
  style_id: string;
  prompt: string;
  created_at: string;
  updated_at: string;
  carousel_styles: CarouselStyle;
  carousel_slides: Array<{
    id: string;
    image_url: string | null;
    text: string;
    position: number;
    background_color: string | null;
    text_color: string | null;
  }>;
}

export type DashboardProject = {
  id: string;
  title: string;  
  createdAt: Date; 
};

export async function getUserCarousels(userId: string): Promise<Carousel[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await (supabase as any)
    .from('carousels')
    .select(`
      *,
      carousel_styles (*),
      carousel_slides (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching carousels:', error);
    throw error;
  }

  return data?.map(transformDatabaseCarousel) || [];
}

export async function createCarousel(
  userId: string,
  carouselData: {
    title: string;
    styleId: string;
    prompt: string;
    slides: Array<{
      text: string;
      position: number;
      imageUrl?: string;
      backgroundColor?: string;
      textColor?: string;
    }>;
  }
): Promise<Carousel> {
  const supabase = getSupabaseClient();

  // Create the carousel
  const { data: carousel, error: carouselError } = await (supabase as any)
    .from('carousels')
    .insert({
      user_id: userId,
      title: carouselData.title,
      style_id: carouselData.styleId,
      prompt: carouselData.prompt,
    })
    .select()
    .single();

  if (carouselError) {
    console.error('Error creating carousel:', carouselError);
    throw carouselError;
  }

  // Create the slides
  const slidesData = carouselData.slides.map(slide => ({
    carousel_id: (carousel as any).id,
    text: slide.text,
    position: slide.position,
    image_url: slide.imageUrl || null,
    background_color: slide.backgroundColor || null,
    text_color: slide.textColor || null,
  }));

  const { error: slidesError } = await (supabase as any)
    .from('carousel_slides')
    .insert(slidesData);

  if (slidesError) {
    console.error('Error creating slides:', slidesError);
    throw slidesError;
  }

  // Fetch the complete carousel with style and slides
  const { data: completeCarousel, error: fetchError } = await (supabase as any)
    .from('carousels')
    .select(`
      *,
      carousel_styles (*),
      carousel_slides (*)
    `)
    .eq('id', (carousel as any).id)
    .single();

  if (fetchError) {
    console.error('Error fetching complete carousel:', fetchError);
    throw fetchError;
  }

  return transformDatabaseCarousel(completeCarousel);
}

export async function updateCarousel(
  carouselId: string,
  updates: {
    title?: string;
    slides?: Array<{
      id?: string;
      text: string;
      position: number;
      imageUrl?: string;
      backgroundColor?: string;
      textColor?: string;
    }>;
  }
): Promise<Carousel> {
  const supabase = getSupabaseClient();

  // Update carousel basic info
  if (updates.title) {
    const { error: carouselError } = await (supabase as any)
      .from('carousels')
      .update({ title: updates.title })
      .eq('id', carouselId);

    if (carouselError) {
      console.error('Error updating carousel:', carouselError);
      throw carouselError;
    }
  }

  // Update slides if provided
  if (updates.slides) {
    // Delete existing slides
    const { error: deleteError } = await (supabase as any)
      .from('carousel_slides')
      .delete()
      .eq('carousel_id', carouselId);

    if (deleteError) {
      console.error('Error deleting slides:', deleteError);
      throw deleteError;
    }

    // Insert new slides
    const slidesData = updates.slides.map(slide => ({
      carousel_id: carouselId,
      text: slide.text,
      position: slide.position,
      image_url: slide.imageUrl || null,
      background_color: slide.backgroundColor || null,
      text_color: slide.textColor || null,
    }));

    const { error: insertError } = await (supabase as any)
      .from('carousel_slides')
      .insert(slidesData);

    if (insertError) {
      console.error('Error inserting slides:', insertError);
      throw insertError;
    }
  }

  // Fetch the updated carousel
  const { data: updatedCarousel, error: fetchError } = await (supabase as any)
    .from('carousels')
    .select(`
      *,
      carousel_styles (*),
      carousel_slides (*)
    `)
    .eq('id', carouselId)
    .single();

  if (fetchError) {
    console.error('Error fetching updated carousel:', fetchError);
    throw fetchError;
  }

  return transformDatabaseCarousel(updatedCarousel);
}

export async function deleteCarousel(carouselId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await (supabase as any)
    .from('carousels')
    .delete()
    .eq('id', carouselId);

  if (error) {
    console.error('Error deleting carousel:', error);
    throw error;
  }
}

function transformDatabaseCarousel(dbCarousel: DatabaseCarousel): Carousel {
  return {
    id: dbCarousel.id,
    title: dbCarousel.title,
    style: {
      id: (dbCarousel.carousel_styles as any).id,
      name: (dbCarousel.carousel_styles as any).name,
      description: (dbCarousel.carousel_styles as any).description,
      preview: (dbCarousel.carousel_styles as any).preview_url,
      category: (dbCarousel.carousel_styles as any).category,
      colors: (dbCarousel.carousel_styles as any).colors,
    },
    slides: (dbCarousel.carousel_slides as any[])
      .sort((a, b) => a.position - b.position)
      .map(slide => ({
        id: slide.id,
        imageUrl: slide.image_url || '',
        text: slide.text,
        position: slide.position,
        backgroundColor: slide.background_color,
        textColor: slide.text_color,
      })),
    prompt: dbCarousel.prompt,
    createdAt: new Date(dbCarousel.created_at),
  };
}


interface SupabaseJoinedProject {
    project_id: string;
    projects: {
        id: string;
        name: string;
        created_at: string;
    } | null; // Projects can be null if the join fails, though unlikely here
}


export async function fetchDashboardProjects(userId: string): Promise<DashboardProject[]> {
  const supabase = getSupabaseClient();
  
  // 1. Query the 'user_projects' table and perform a join
  const { data, error } = await (supabase as any)
    .from('user_projects')
    .select(`
      project_id,
      projects (id, name, created_at)
    `)
    .eq('user_id', userId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Error fetching dashboard projects:', error);
    throw error;
  }

  // 2. Map and flatten the data structure, explicitly using the new interface type
  const projects = (data as SupabaseJoinedProject[]).map((item) => { // 🎯 FIX 1: Cast data array
      
      // 🎯 FIX 2: Explicitly type the item parameter
      const projectData = item.projects; 
      
      // Filter out null results (safety check)
      if (!projectData) return null;

      return {
          id: projectData.id,
          title: projectData.name, // The project name is the title
          createdAt: new Date(projectData.created_at),
      } as DashboardProject;
  }).filter((item): item is DashboardProject => item !== null); // 🎯 FIX 3: Type assertion filter

  return projects;
}