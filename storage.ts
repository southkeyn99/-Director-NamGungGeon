
import { PortfolioData } from './types';
import { INITIAL_DATA } from './constants';

export const storageService = {
  getCredentials() {
    return {
      binId: localStorage.getItem('CLOUDSYNC_BIN_ID') || '',
      apiKey: localStorage.getItem('CLOUDSYNC_API_KEY') || ''
    };
  },

  // 데이터 구조가 올바른지 확인하는 보조 함수
  isValidData(data: any): data is PortfolioData {
    return data && typeof data === 'object' && 'content' in data && 'projects' in data;
  },

  async getPortfolio(): Promise<PortfolioData | null> {
    const { binId, apiKey } = this.getCredentials();
    if (!binId || !apiKey) return null;

    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: { 'X-Master-Key': apiKey },
        cache: 'no-cache'
      });
      
      if (!response.ok) return null;
      
      const result = await response.json();
      const remoteData = result.record;

      // 만약 서버 데이터가 비어있거나 형식이 맞지 않으면 초기 데이터를 반환하고 서버에 저장 시도
      if (!this.isValidData(remoteData)) {
        console.warn("Server data is empty or invalid. Initializing...");
        await this.savePortfolio(INITIAL_DATA);
        return INITIAL_DATA;
      }

      return remoteData as PortfolioData;
    } catch (err) {
      console.error("Cloud load failed:", err);
      return null;
    }
  },

  async savePortfolio(data: PortfolioData): Promise<void> {
    const { binId, apiKey } = this.getCredentials();
    if (!binId || !apiKey) {
      localStorage.setItem('OFFLINE_PORTFOLIO_DATA', JSON.stringify(data));
      return;
    }

    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': apiKey
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('클라우드 저장 실패');
    } catch (err) {
      console.error("Save error:", err);
      throw err;
    }
  },

  async uploadImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
};
