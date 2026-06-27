import { supabase } from '../../supabaseClient';
import { AlumniHighlight } from '../pages/AlumniHighlights';

export type CreateHighlightInput = Omit<AlumniHighlight, 'id' | 'created_at' | 'created_by'>;

export const alumniHighlightsService = {
  // Fetch all published highlights for the carousel
  async getPublishedHighlights(): Promise<AlumniHighlight[]> {
    try {
      const { data, error } = await supabase
        .from('alumni_highlights')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching published highlights:', error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error in getPublishedHighlights:', err);
      return [];
    }
  },

  // Fetch all highlights (for admin management)
  async getAllHighlights(): Promise<AlumniHighlight[]> {
    try {
      const { data, error } = await supabase
        .from('alumni_highlights')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching all highlights:', error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error in getAllHighlights:', err);
      return [];
    }
  },

  // Create a new highlight
  async createHighlight(input: CreateHighlightInput, userId: string): Promise<AlumniHighlight> {
    try {
      const { data, error } = await supabase
        .from('alumni_highlights')
        .insert([
          {
            ...input,
            created_by: userId,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating highlight:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error in createHighlight:', err);
      throw err;
    }
  },

  // Update an existing highlight
  async updateHighlight(id: string, updates: Partial<AlumniHighlight>): Promise<AlumniHighlight> {
    try {
      const { data, error } = await supabase
        .from('alumni_highlights')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating highlight:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error in updateHighlight:', err);
      throw err;
    }
  },

  // Delete a highlight
  async deleteHighlight(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('alumni_highlights')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting highlight:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error in deleteHighlight:', err);
      throw err;
    }
  },

  // Toggle publish status
  async togglePublish(id: string, published: boolean): Promise<AlumniHighlight> {
    try {
      const { data, error } = await supabase
        .from('alumni_highlights')
        .update({ published })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling publish status:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error in togglePublish:', err);
      throw err;
    }
  },

  // Upload image to Supabase Storage
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('alumni-highlights')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('alumni-highlights')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Error in uploadImage:', err);
      throw err;
    }
  },

  // Upload multiple images
  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, 'highlights'));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (err) {
      console.error('Error in uploadImages:', err);
      throw err;
    }
  },

  // Delete image from storage
  async deleteImage(url: string): Promise<void> {
    try {
      // Extract path from URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const path = urlParts[urlParts.length - 2];

      const { error } = await supabase.storage
        .from('alumni-highlights')
        .remove([`${path}/${fileName}`]);

      if (error) {
        console.error('Error deleting image:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error in deleteImage:', err);
      throw err;
    }
  },
};