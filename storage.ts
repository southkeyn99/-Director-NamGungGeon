
import { PortfolioData } from './types';
import { supabase } from './supabase';

export const storageService = {
  // Fetch site data from Supabase DB
  async getPortfolio(): Promise<PortfolioData | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('portfolio')
      .select('data')
      .eq('id', 1)
      .single();

    if (error) {
      console.warn("Database fetch error:", error.message);
      return null;
    }
    return data?.data as PortfolioData;
  },

  // Save site data to Supabase DB (Instant Update)
  async savePortfolio(data: PortfolioData): Promise<void> {
    if (!supabase) throw new Error("Supabase client not initialized");

    const { error } = await supabase
      .from('portfolio')
      .upsert({ id: 1, data: data, updated_at: new Date().toISOString() });

    if (error) throw error;
  },

  // Upload image to Supabase Storage Bucket ('media')
  async uploadImage(file: File): Promise<string> {
    if (!supabase) throw new Error("Supabase client not initialized");

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};
