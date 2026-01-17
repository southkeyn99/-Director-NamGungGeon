
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
        headers: { 
          'X-Master-Key': apiKey,
          'X-Bin-Meta': 'false'
        },
        cache: 'no-cache'
      });
      
      if (response.status === 401 || response.status === 403) throw new Error('API Key가 올바르지 않습니다.');
      if (response.status === 404) throw new Error('Bin ID를 찾을 수 없습니다.');
      if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);
      
      const remoteData = await response.json();
      const dataToUse = remoteData.record || remoteData;

      if (!this.isValidData(dataToUse)) return INITIAL_DATA;
      return dataToUse as PortfolioData;
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

    // 데이터 크기 대략적 계산 (문자열 길이)
    const jsonString = JSON.stringify(data);
    const sizeInKb = (jsonString.length * 2) / 1024; // 대략적인 KB 계산
    
    console.log(`Current data size: ~${sizeInKb.toFixed(2)} KB`);

    if (sizeInKb > 1024) { // 1MB 초과 시 경고
       throw new Error(`데이터가 너무 큽니다 (${sizeInKb.toFixed(0)}KB). 사진을 더 적게 사용하거나 더 작게 줄여주세요.`);
    }

    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': apiKey
        },
        body: jsonString,
      });

      if (response.status === 413) throw new Error('서버 용량 제한 초과! 사진을 삭제하거나 더 작은 크기로 다시 올려주세요.');
      if (response.status === 429) throw new Error('너무 자주 저장 시도를 했습니다. 1분 후 다시 시도하세요.');
      if (!response.ok) throw new Error(`저장 실패 (${response.status})`);
    } catch (err: any) {
      console.error("Save error:", err);
      throw err;
    }
  },

  // 이미지를 압축하여 DataURL로 반환하는 함수
  async uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // 최대 가로폭을 1000px로 제한 (용량 최적화의 핵심)
          const MAX_WIDTH = 1000;
          if (width > MAX_WIDTH) {
            height = (MAX_WIDTH / width) * height;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas context failed');

          ctx.drawImage(img, 0, 0, width, height);
          
          // JPEG 포맷으로 압축 (0.5는 화질 50%를 의미하며, 용량을 엄청나게 줄여줌)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject('Image load error');
      };
      reader.onerror = () => reject('File read error');
    });
  }
};
