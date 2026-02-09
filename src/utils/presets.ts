export interface Preset {
  id: string;
  name: string;
  items: string[];
  isDefault?: boolean;
}

const STORAGE_KEY = 'random-picker-presets';

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'default-lunch',
    name: '점심 메뉴',
    items: ['김치찌개', '된장찌개', '비빔밥', '불고기', '치킨', '피자', '파스타', '초밥', '떡볶이', '냉면'],
    isDefault: true,
  },
  {
    id: 'default-penalty',
    name: '벌칙 게임',
    items: ['노래 부르기', '춤추기', '개인기', '양심고백', '러브샷', '물 벌컵', '사투리 연기', '10초 눈싸움'],
    isDefault: true,
  },
  {
    id: 'default-cafe',
    name: '카페 메뉴',
    items: ['아메리카노', '카페라떼', '바닐라라떼', '카푸치노', '아이스티', '말차라떼', '카라멜 마끼아또', '스무디'],
    isDefault: true,
  },
];

export function loadCustomPresets(): Preset[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomPreset(preset: Omit<Preset, 'id'>): Preset {
  const customs = loadCustomPresets();
  const newPreset: Preset = {
    ...preset,
    id: `custom-${Date.now()}`,
  };
  customs.push(newPreset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
  return newPreset;
}

export function deleteCustomPreset(id: string): void {
  const customs = loadCustomPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
}

export function getAllPresets(): Preset[] {
  return [...DEFAULT_PRESETS, ...loadCustomPresets()];
}

// ── Team Group (팀 나누기 전용) ──

const TEAM_STORAGE_KEY = 'random-picker-team-groups';

export const DEFAULT_TEAM_PRESETS: Preset[] = [
  {
    id: 'default-team-1',
    name: '팀 예시 (8명)',
    items: ['김철수', '이영희', '박민수', '정수진', '최동현', '한지은', '오승우', '강미래'],
    isDefault: true,
  },
];

export function loadTeamGroups(): Preset[] {
  try {
    const data = localStorage.getItem(TEAM_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTeamGroup(preset: Omit<Preset, 'id'>): Preset {
  const groups = loadTeamGroups();
  const newGroup: Preset = {
    ...preset,
    id: `team-${Date.now()}`,
  };
  groups.push(newGroup);
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(groups));
  return newGroup;
}

export function deleteTeamGroup(id: string): void {
  const groups = loadTeamGroups().filter((p) => p.id !== id);
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(groups));
}

export function getAllTeamGroups(): Preset[] {
  return [...DEFAULT_TEAM_PRESETS, ...loadTeamGroups()];
}
