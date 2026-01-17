
import { PortfolioData } from './types';

/**
 * JSONbin.io 기반의 초간단 클라우드 스토리지 서비스
 * 사용자가 관리자 페이지에서 설정한 ID와 KEY를 사용합니다.
 */
export const storageService = {
  getCredentials() {
    return {
      binId: localStorage.getItem('CLOUDSYNC_BIN_ID') || '',
      apiKey: localStorage.getItem('CLOUDSYNC_API_KEY') || ''
    };
  },

  async getPortfolio(): Promise<PortfolioData | null> {
    const { binId, apiKey } = this.getCredentials();
    if (!binId || !apiKey) return null;

    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: { 'X-Master-Key': apiKey }
      });
      if (!response.ok) return null;
      const result = await response.json();
      return result.record as PortfolioData;
    } catch (err) {
      console.error("Cloud load failed:", err);
      return null;
    }
  },

  async savePortfolio(data: PortfolioData): Promise<void> {
    const { binId, apiKey } = this.getCredentials();
    if (!binId || !apiKey) {
      // 로컬에만 우선 저장 (클라우드 미연결 시)
      localStorage.setItem('OFFLINE_PORTFOLIO_DATA', JSON.stringify(data));
      return;
    }

    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('클라우드 저장 실패');
  },

  // 이미지는 여전히 무료인 외부 서비스를 이용하거나 base64로 저장
  async uploadImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
};
