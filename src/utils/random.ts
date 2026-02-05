/** Fisher-Yates 셔플 */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 배열에서 n개 랜덤 뽑기 (중복 없음) */
export function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = shuffleArray(arr);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/** min~max 범위에서 count개 중복 없이 뽑기 */
export function pickNumbers(min: number, max: number, count: number): number[] {
  const range = max - min + 1;
  const actualCount = Math.min(count, range);
  const numbers: number[] = [];
  const used = new Set<number>();

  while (numbers.length < actualCount) {
    const n = Math.floor(Math.random() * range) + min;
    if (!used.has(n)) {
      used.add(n);
      numbers.push(n);
    }
  }
  return numbers;
}

/** 이름 배열을 teamCount개 팀으로 나누기 */
export function divideTeams(names: string[], teamCount: number): string[][] {
  const shuffled = shuffleArray(names);
  const teams: string[][] = Array.from({ length: teamCount }, () => []);

  shuffled.forEach((name, i) => {
    teams[i % teamCount].push(name);
  });

  return teams;
}
