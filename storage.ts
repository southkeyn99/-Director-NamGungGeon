
import { PortfolioData } from './types';

/**
 * Vercel Postgres & Blob Storage Service
 * Handles all data persistence via API routes.
 */
export const storageService = {
  // Fetch site data from Vercel Postgres
  async getPortfolio(): Promise<PortfolioData> {
    const response = await fetch('/api/portfolio');
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return response.json();
  },

  // Save site data to Vercel Postgres
  async savePortfolio(data: PortfolioData): Promise<void> {
    const response = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to save: ${response.statusText}`);
    }
  },

  // Upload image to Vercel Blob
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Image upload failed');
    }

    const { url } = await response.json();
    return url;
  }
};
