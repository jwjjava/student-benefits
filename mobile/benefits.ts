import type { ImageSourcePropType } from 'react-native';

export const categories = ['전체', '음식점', '구독', 'IT', '뷰티'] as const;
export const sorts = ['추천순', '인기순', '가까운 순'] as const;
export type Category = (typeof categories)[number];
export type Sort = (typeof sorts)[number];

export type Benefit = {
  id: string;
  category: Exclude<Category, '전체'>;
  vendor: string;
  title: string;
  note: string;
  artwork: ImageSourcePropType;
  tile?: { column: number; row: number };
  popularity: number;
  distances?: { current: number; campus: number };
  expired?: boolean;
  instructions?: string;
};

const tileSheet = require('./assets/figma.png');
const vertex = require('./assets/vertex.png');
const ediya = require('./assets/ediya.png');

export const benefits: Benefit[] = [
  { id: 'vertex', category: '음식점', vendor: '버텍스 한양대에리카점', title: '치킨덮밥 15% 할인', note: '매장 방문', artwork: vertex, popularity: 96, distances: { current: 180, campus: 230 }, instructions: '평일 11:00–14:00, 주문 전 학생증을 보여주세요.' },
  { id: 'notion', category: '구독', vendor: 'Notion', title: '개인 플러스 플랜 무료', note: '학교 이메일 · 1인 워크스페이스', artwork: tileSheet, tile: { column: 0, row: 0 }, popularity: 99 },
  { id: 'figma', category: 'IT', vendor: 'Figma', title: '교육 플랜 무료', note: '학생·교사 인증', artwork: tileSheet, tile: { column: 1, row: 0 }, popularity: 92 },
  { id: 'ediya', category: '음식점', vendor: '이디야커피 안산한대점', title: '카페라테 1,000원 할인', note: '매장 주문', artwork: ediya, popularity: 94, distances: { current: 260, campus: 320 } },
  { id: 'innisfree', category: '뷰티', vendor: '이니스프리', title: '그린티 세럼 20% 할인', note: '온라인 스토어', artwork: tileSheet, tile: { column: 2, row: 0 }, popularity: 73 },
  { id: 'spotify', category: '구독', vendor: 'Spotify', title: '프리미엄 학생 요금제', note: '대상 대학 재학생 인증', artwork: tileSheet, tile: { column: 0, row: 1 }, popularity: 89 },
  { id: 'github', category: 'IT', vendor: 'GitHub', title: '학생 개발자 팩', note: '재학생 인증 · 개발 도구', artwork: tileSheet, tile: { column: 1, row: 1 }, popularity: 97 },
  { id: 'roundlab', category: '뷰티', vendor: '라운드랩', title: '독도 토너 10% 할인', note: '온라인 쿠폰', artwork: tileSheet, tile: { column: 2, row: 1 }, popularity: 78 },
  { id: 'vertex-takeout', category: '음식점', vendor: '버텍스 한양대에리카점', title: '치킨덮밥 포장 할인', note: '포장 주문', artwork: vertex, popularity: 81, distances: { current: 180, campus: 230 } },
  { id: 'figma-team', category: 'IT', vendor: 'Figma', title: '교육용 팀 이용', note: '교육 자격 인증', artwork: tileSheet, tile: { column: 1, row: 0 }, popularity: 70, expired: true },
  { id: 'copilot', category: 'IT', vendor: 'GitHub', title: 'Copilot 학생용', note: '재학생 인증', artwork: tileSheet, tile: { column: 1, row: 1 }, popularity: 87 },
  { id: 'americano', category: '음식점', vendor: '이디야커피 안산한대점', title: '아메리카노 할인', note: '매장 주문', artwork: require('./assets/americano.png'), popularity: 82, distances: { current: 260, campus: 320 } },
];

export function findBenefits(query: string) {
  const words = query.toLocaleLowerCase('ko-KR').trim().split(/\s+/);
  return benefits.filter(({ category, vendor, title, note }) => {
    const keywords = `${category} ${vendor} ${title} ${note} 학생 혜택 할인`.toLocaleLowerCase('ko-KR');
    return words.every((word) => keywords.includes(word));
  });
}
