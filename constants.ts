
import { PortfolioData } from './types';

export const INITIAL_DATA: PortfolioData = {
  projects: [
    {
      id: '1',
      category: 'DIRECTING',
      year: '2023',
      titleKr: '밤의 파편',
      titleEn: 'Fragments of the Night',
      genre: 'Noir / Drama',
      runtime: '24min',
      role: 'Director / Writer',
      synopsis: '어둠이 가득한 도시에서 잃어버린 기억의 조각을 찾아 헤매는 남자의 이야기. 차가운 색조와 고요한 미장센을 통해 고독을 시각화하였다.',
      awards: ['2023 서울독립영화제 상영작', '제25회 부산국제영화제 우수상'],
      mainImage: 'https://picsum.photos/id/10/1200/800',
      stills: ['https://picsum.photos/id/11/800/600', 'https://picsum.photos/id/12/800/600']
    }
  ],
  staff: [
    { id: 's1', year: '2024', project: '대형 프로젝트 A', role: 'Camera Assistant', awards: [] },
    { id: 's2', year: '2023', project: '단편 영화 B', role: 'Lighting Staff', awards: [] }
  ],
  content: {
    name: 'KIM DIRECTOR',
    philosophy: 'STILLNESS IN MOTION, SILENCE IN SOUND',
    aboutText: '영화적인 시각과 깊이 있는 탐구를 통해 인간의 내면을 포착합니다. 연출과 촬영의 경계를 허물고 고유한 미학을 구축하고자 합니다.',
    contact: {
      email: 'director@example.com',
      phone: '+82 10-1234-5678',
      instagram: 'https://instagram.com/director_portfolio',
      youtube: 'https://youtube.com/@director'
    },
    contactTitle: "Let's collaborate on your next story",
    homeBgImage: 'https://picsum.photos/id/20/1920/1080?grayscale',
    profileImage: 'https://picsum.photos/id/64/400/400?grayscale'
  }
};
