
import { PortfolioData } from './types';
import { INITIAL_DATA } from './constants';

export const storageService = {
  getCredentials() {
    return {
      binId: (localStorage.getItem('CLOUDSYNC_BIN_ID') || '').trim(),
      apiKey: (localStorage.getItem('CLOUDSYNC_API_KEY') || '').trim()
    };
  },

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
      
      if (response.status === 401 || response.status === 403) throw new Error('API Key가 올바르지 않습니다.');
      if (response.status === 404) throw new Error('Bin ID를 찾을 수 없습니다.');
      if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);
      
      const result = await response.json();
      const remoteData = result.record;

      if (!this.isValidData(remoteData)) {
        await this.savePortfolio(INITIAL_DATA);
        return INITIAL_DATA;
      }

      return remoteData as PortfolioData;
    } catch (err: any) {
      console.error("Cloud load failed:", err);
      throw err;
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

      if (response.status === 413) throw new Error('데이터 용량이 너무 큽니다. 사진 크기를 줄여주세요.');
      if (response.status === 429) throw new Error('너무 자주 저장 시도를 했습니다. 잠시 후 다시 시도하세요.');
      if (response.status === 401 || response.status === 403) throw new Error('API Key 인증에 실패했습니다.');
      
      if (!response.ok) throw new Error(`저장 실패 (${response.status})`);
    } catch (err: any) {
      console.error("Save error:", err);
      throw err;
    }
  },

  async uploadImage(file: File): Promise<string> {
    // 이미지 용량이 너무 크면 압축 권고 (약 1MB 이상인 경우)
    if (file.size > 1 * 1024 * 1024) {
      console.warn("Large image detected. This might cause storage failure.");
    }
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
};
