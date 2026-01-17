
import { PortfolioData } from './types';

/**
 * Vercel Native Storage Service
 * 가장 단순한 Fetch 기반 인터페이스
 */
export const storageService = {
  // 1. 전체 데이터 불러오기 (Vercel Postgres/KV 연동)
  async getPortfolio(): Promise<PortfolioData | null> {
    try {
      const response = await fetch('/api/portfolio');
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.error("Data fetch failed:", err);
      return null;
    }
  },

  // 2. 전체 데이터 저장하기
  async savePortfolio(data: PortfolioData): Promise<void> {
    const response = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('서버 저장 실패');
    }
  },

  // 3. 이미지 업로드 (Vercel Blob 연동)
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('이미지 업로드 실패');
    }

    const { url } = await response.json();
    return url;
  }
};
